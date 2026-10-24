// search-artisans — Lot 8. Remplace features/artisans/filtering.ts (filtrage/tri 100 % JS
// sur un tableau en mémoire) par une vraie recherche PostGIS + Postgrest, en gardant
// exactement la forme ArtisansPage attendue par hooks.ts côté client (aucun changement UI).
//
// availability (bucket 'today'/'tomorrow'/'week'/'later') : le mock la dérivait d'un objet
// riche {today, nextSlot} propre à chaque fiche de démo ; le schéma partagé
// (docs/MODELE-DONNEES.md) n'a que `available boolean` + `unavailable_until` — le bucket est
// donc redérivé ici à partir de ces 2 seules colonnes (available=true → 'today' ; sinon,
// l'écart de jours jusqu'à unavailable_until). Approximation assumée, comme l'était déjà la
// disponibilité du mock elle-même.
import { z } from 'npm:zod@4';

import { errorResponse, handlePreflight, jsonResponse, serviceRoleClient } from '../_shared/client.ts';

const COTONOU_CENTER = { lat: 6.3703, lng: 2.3912 };

const filtersSchema = z.object({
  trades: z.array(z.string()).default([]),
  availability: z.enum(['today', 'tomorrow', 'week', 'later']).optional(),
  maxDistanceKm: z.number().positive().optional(),
  minRating: z.number().min(0).max(5).optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().nonnegative().optional(),
  includeOnQuote: z.boolean().default(true),
  verificationLevels: z.array(z.enum(['identity', 'skills', 'pro'])).default([]),
  minExperienceYears: z.number().int().nonnegative().optional(),
});

const inputSchema = z.object({
  filters: filtersSchema,
  sort: z.enum(['relevance', 'rating', 'distance', 'priceAsc']).default('relevance'),
  page: z.number().int().nonnegative().default(0),
  pageSize: z.number().int().positive().default(6),
  near: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

function dayBucket(days: number): 'today' | 'tomorrow' | 'week' | 'later' {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 7) return 'week';
  return 'later';
}

function availabilityBucketFor(available: boolean, unavailableUntil: string | null, now: Date) {
  if (available) return 'today' as const;
  if (!unavailableUntil) return 'later' as const;
  const days = Math.ceil((new Date(unavailableUntil).getTime() - now.getTime()) / 86_400_000);
  return dayBucket(days);
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const parsed = inputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse('Requête invalide', 400);
  const { filters, sort, page, pageSize, near } = parsed.data;
  const origin = near ?? COTONOU_CENTER;

  const db = serviceRoleClient();

  const { data: distances, error: distanceError } = await db.rpc('artisans_within', {
    lat: origin.lat,
    lng: origin.lng,
    max_distance_km: filters.maxDistanceKm ?? null,
  });
  if (distanceError) return errorResponse(distanceError.message, 500);
  const distanceById = new Map<string, number>((distances ?? []).map((d: { artisan_id: string; distance_km: number }) => [d.artisan_id, d.distance_km]));

  let query = db
    .from('artisans')
    .select(
      `id, trade, bio, verification, years_experience, price_from, rating, review_count,
       interventions, available, unavailable_until, online_at,
       profiles!artisans_id_fkey(first_name, last_name, avatar_url),
       artisan_categories(category_id),
       artisan_skills(label),
       artisan_zones(city, neighborhood),
       artisan_prices(label, amount_from, exact),
       artisan_gallery(storage_path, caption, tag)`,
    );

  if (filters.trades.length > 0) {
    query = query.in('artisan_categories.category_id', filters.trades);
  }
  if (filters.minRating !== undefined) query = query.gte('rating', filters.minRating);
  if (filters.verificationLevels.length > 0) query = query.in('verification', filters.verificationLevels);
  if (filters.minExperienceYears !== undefined) query = query.gte('years_experience', filters.minExperienceYears);
  if (!filters.includeOnQuote) query = query.not('price_from', 'is', null);
  if (filters.priceMin !== undefined) query = query.gte('price_from', filters.priceMin);
  if (filters.priceMax !== undefined) query = query.lte('price_from', filters.priceMax);

  const { data: rows, error: rowsError } = await query;
  if (rowsError) return errorResponse(rowsError.message, 500);

  const now = new Date();
  type Row = NonNullable<typeof rows>[number];
  let items = (rows as Row[])
    .filter((r) => filters.trades.length === 0 || r.artisan_categories.some((c) => filters.trades.includes(c.category_id)))
    .map((r) => {
      const bucket = availabilityBucketFor(r.available, r.unavailable_until, now);
      return { row: r, distanceKm: distanceById.get(r.id) ?? null, bucket };
    })
    .filter((x) => x.distanceKm !== null)
    .filter((x) => !filters.availability || x.bucket === filters.availability);

  items.sort((a, b) => {
    if (sort === 'rating') return b.row.rating - a.row.rating;
    if (sort === 'distance') return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
    if (sort === 'priceAsc') {
      if (a.row.price_from === null) return 1;
      if (b.row.price_from === null) return -1;
      return a.row.price_from - b.row.price_from;
    }
    // relevance (défaut) : note desc, puis nombre d'avis desc — comme applySort() côté mock.
    if (b.row.rating !== a.row.rating) return b.row.rating - a.row.rating;
    return b.row.review_count - a.row.review_count;
  });

  const total = items.length;
  const start = page * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  const result = pageItems.map(({ row, distanceKm, bucket }) => ({
    id: row.id,
    firstName: row.profiles?.first_name ?? '',
    lastName: row.profiles?.last_name ?? '',
    avatarUrl: row.profiles?.avatar_url ?? undefined,
    trade: row.trade,
    categories: row.artisan_categories.map((c) => c.category_id),
    neighborhood: row.artisan_zones[0]?.neighborhood ?? '',
    city: row.artisan_zones[0]?.city ?? '',
    distanceKm: Math.round((distanceKm ?? 0) * 10) / 10,
    rating: row.rating,
    reviewCount: row.review_count,
    interventions: row.interventions,
    yearsExperience: row.years_experience,
    verification: row.verification,
    online: row.available && row.online_at !== null,
    availability: { label: bucket, today: bucket === 'today' },
    priceFrom: row.price_from,
    bio: row.bio ?? undefined,
    skills: row.artisan_skills.map((s) => s.label),
    zones: row.artisan_zones.map((z) => ({ city: z.city, neighborhoods: [z.neighborhood] })),
    prices: row.artisan_prices.map((p) => ({ label: p.label, from: p.amount_from, exact: p.exact })),
    gallery: row.artisan_gallery.map((g, i) => ({ id: String(i), caption: g.caption, tag: g.tag, url: g.storage_path ?? undefined })),
  }));

  return jsonResponse({
    items: result,
    page,
    total,
    hasNextPage: start + pageItems.length < total,
  });
});
