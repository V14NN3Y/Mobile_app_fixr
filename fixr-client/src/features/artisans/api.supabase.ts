import { ApiError } from '@/lib/apiError';
import { supabase } from '@/lib/supabase';
import type { Artisan } from '@/types/domain';

import type { ArtisanFilters, ArtisanSort } from './types';

export type ArtisansPage = {
  items: Artisan[];
  page: number;
  total: number;
  hasNextPage: boolean;
};

export type SearchArtisansInput = {
  filters: ArtisanFilters;
  sort: ArtisanSort;
  page: number;
  pageSize: number;
  /** Position de référence pour la distance — adresse principale du client, si connue. */
  near?: { lat: number; lng: number };
};

/** PostGIS fait ce calcul côté serveur pour la recherche paginée (Edge Function
 * search-artisans) ; ici, une seule paire de points pour le profil d'un artisan — pas besoin
 * d'une extension pour ça. */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const COTONOU_CENTER = { lat: 6.3703, lng: 2.3912 };

const ARTISAN_SELECT = `id, trade, bio, verification, years_experience, price_from, rating, review_count,
  interventions, available, unavailable_until, online_at, base_location,
  profiles!artisans_id_fkey(first_name, last_name, avatar_url),
  artisan_categories(category_id),
  artisan_skills(label),
  artisan_zones(city, neighborhood),
  artisan_prices(label, amount_from, exact),
  artisan_gallery(storage_path, caption, tag)`;

type ArtisanRow = {
  id: string;
  trade: string;
  bio: string | null;
  verification: Artisan['verification'];
  years_experience: number;
  price_from: number | null;
  rating: number;
  review_count: number;
  interventions: number;
  available: boolean;
  unavailable_until: string | null;
  online_at: string | null;
  base_location: { coordinates: [number, number] } | null;
  profiles: { first_name: string; last_name: string; avatar_url: string | null } | null;
  artisan_categories: { category_id: string }[];
  artisan_skills: { label: string }[];
  artisan_zones: { city: string; neighborhood: string }[];
  artisan_prices: { label: string; amount_from: number | null; exact: boolean }[];
  artisan_gallery: { storage_path: string | null; caption: string; tag: string }[];
};

function toArtisan(row: ArtisanRow, origin: { lat: number; lng: number }): Artisan {
  const [lng, lat] = row.base_location?.coordinates ?? [origin.lng, origin.lat];
  const distanceKm = Math.round(haversineKm(origin.lat, origin.lng, lat, lng) * 10) / 10;

  return {
    id: row.id,
    firstName: row.profiles?.first_name ?? '',
    lastName: row.profiles?.last_name ?? '',
    avatarUrl: row.profiles?.avatar_url ?? undefined,
    trade: row.trade,
    categories: row.artisan_categories.map((c) => c.category_id as Artisan['categories'][number]),
    neighborhood: row.artisan_zones[0]?.neighborhood ?? '',
    city: row.artisan_zones[0]?.city ?? '',
    distanceKm,
    rating: row.rating,
    reviewCount: row.review_count,
    interventions: row.interventions,
    yearsExperience: row.years_experience,
    verification: row.verification,
    online: row.available && row.online_at !== null,
    availability: {
      label: row.available ? 'Disponible' : 'Indisponible',
      today: row.available,
      unavailableUntil: row.unavailable_until ?? undefined,
    },
    priceFrom: row.price_from,
    bio: row.bio ?? undefined,
    skills: row.artisan_skills.map((s) => s.label),
    zones: row.artisan_zones.map((z) => ({ city: z.city, neighborhoods: [z.neighborhood] })),
    prices: row.artisan_prices.map((p) => ({ label: p.label, from: p.amount_from, exact: p.exact })),
    gallery: row.artisan_gallery.map((g, i) => ({
      id: String(i),
      caption: g.caption,
      tag: g.tag,
      url: g.storage_path ?? undefined,
    })),
    lat,
    lng,
  };
}

/** Filtrage/tri/pagination + distance PostGIS : voir supabase/functions/search-artisans. */
export async function searchArtisans(input: SearchArtisansInput): Promise<ArtisansPage> {
  const { data, error } = await supabase.functions.invoke<ArtisansPage>('search-artisans', {
    body: {
      filters: input.filters,
      sort: input.sort,
      page: input.page,
      pageSize: input.pageSize,
      near: input.near,
    },
  });
  if (error) throw new ApiError(error.message);
  return data!;
}

export async function getArtisan(id: string, near?: { lat: number; lng: number }): Promise<Artisan> {
  const { data, error } = await supabase.from('artisans').select(ARTISAN_SELECT).eq('id', id).maybeSingle();
  if (error) throw new ApiError(error.message);
  if (!data) throw new ApiError('Artisan introuvable', 404);
  // Sans types générés (supabase gen types), supabase-js infère une relation imbriquée
  // 1-1 (profiles!artisans_id_fkey) comme un tableau par défaut ; Postgrest la renvoie
  // bien comme un objet unique à l'exécution (vérifié) — cast via `unknown`, comme suggéré
  // par TS lui-même ici.
  return toArtisan(data as unknown as ArtisanRow, near ?? COTONOU_CENTER);
}

/** Artisans du même métier que `excludeId`, pour l'état « indisponible » du profil. */
export async function getArtisanAlternatives(excludeId: string): Promise<Artisan[]> {
  const { data: current, error: currentError } = await supabase
    .from('artisan_categories')
    .select('category_id')
    .eq('artisan_id', excludeId);
  if (currentError) throw new ApiError(currentError.message);
  const categoryIds = current.map((c) => c.category_id);
  if (categoryIds.length === 0) return [];

  const { data, error } = await supabase
    .from('artisans')
    // "!inner" force l'exclusion des artisans sans catégorie commune (sans lui, .in() ne
    // filtre que les lignes imbriquées renvoyées, pas les artisans eux-mêmes).
    .select(ARTISAN_SELECT.replace('artisan_categories(category_id)', 'artisan_categories!inner(category_id)'))
    .neq('id', excludeId)
    .eq('available', true)
    .in('artisan_categories.category_id', categoryIds)
    .order('rating', { ascending: false })
    .limit(3);
  if (error) throw new ApiError(error.message);
  return (data as unknown as ArtisanRow[]).map((row) => toArtisan(row, COTONOU_CENTER));
}
