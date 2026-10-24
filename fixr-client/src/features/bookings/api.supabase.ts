import { findActiveBookingForArtisan } from '@/features/artisans/profileState';
import { ApiError } from '@/lib/apiError';
import { supabase } from '@/lib/supabase';
import type { Booking, BookingEvent, BookingStatus, InterventionReport, Quote } from '@/types/domain';

// Même liste que le squelette pré-rempli de src/mocks/data.ts (6 emplacements, 'on_site'
// volontairement absent — incohérence déjà présente côté mock, relevée par l'audit du plan,
// reproduite à l'identique ici pour ne pas changer le rendu de MissionTimeline/timeline.ts).
const EVENT_SKELETON: BookingEvent['type'][] = [
  'requested',
  'artisan_found',
  'confirmed',
  'on_the_way',
  'in_progress',
  'done',
];

const BOOKING_SELECT = `id, artisan_id, category_id, title, description, urgency, open_search, address_id,
  slot_start, slot_end, budget, estimate_min, estimate_max, price_final, status, mission_code,
  cancellable_until, cancelled_by, created_at,
  booking_media(id, kind, storage_path, caption, duration_sec),
  booking_events(type, at),
  artisan_positions(eta_min)`;

type BookingRow = {
  id: string;
  artisan_id: string | null;
  category_id: Booking['categoryId'];
  title: string;
  description: string | null;
  urgency: Booking['urgency'];
  open_search: boolean;
  address_id: string;
  slot_start: string;
  slot_end: string;
  budget: number | null;
  estimate_min: number | null;
  estimate_max: number | null;
  price_final: number | null;
  status: BookingStatus;
  mission_code: string | null;
  cancellable_until: string | null;
  cancelled_by: Booking['cancelledBy'] | null;
  created_at: string;
  booking_media: { id: string; kind: 'photo' | 'video'; storage_path: string | null; caption: string | null; duration_sec: number | null }[];
  booking_events: { type: BookingEvent['type']; at: string }[];
  // artisan_positions.booking_id est À LA FOIS sa clé étrangère et sa clé primaire (1-1
  // strict) : Postgrest le renvoie comme un objet unique ou null, jamais un tableau — même
  // piège que l'embed profiles (artisans/api.supabase.ts), découvert ici via un vrai
  // TypeError à l'exécution ("Cannot read properties of null (reading '0')"), pas deviné.
  artisan_positions: { eta_min: number | null } | null;
};

function toBooking(row: BookingRow, reviewedIds: Set<string>, quotesCountById: Map<string, number>): Booking {
  const eventsByType = new Map(row.booking_events.map((e) => [e.type, e.at]));
  const events: BookingEvent[] = EVENT_SKELETON.map((type) => ({ type, at: eventsByType.get(type) ?? null }));
  if (row.status === 'cancelled') events.push({ type: 'cancelled', at: eventsByType.get('cancelled') ?? null });

  return {
    id: row.id,
    status: row.status,
    categoryId: row.category_id,
    title: row.title,
    description: row.description ?? undefined,
    media: row.booking_media.map((m) => ({
      id: m.id,
      kind: m.kind,
      caption: m.caption ?? undefined,
      url: m.storage_path ?? undefined,
      durationSec: m.duration_sec ?? undefined,
    })),
    urgency: row.urgency,
    artisanId: row.artisan_id ?? undefined,
    openSearch: row.open_search,
    addressId: row.address_id,
    slotStart: row.slot_start,
    slotEnd: row.slot_end,
    budget: row.budget ?? undefined,
    priceEstimate:
      row.estimate_min !== null && row.estimate_max !== null
        ? { min: row.estimate_min, max: row.estimate_max }
        : undefined,
    priceFinal: row.price_final ?? undefined,
    quotesCount: quotesCountById.get(row.id),
    missionCode: row.mission_code ?? undefined,
    etaMin: row.artisan_positions?.eta_min ?? undefined,
    events,
    cancellableUntil: row.cancellable_until ?? undefined,
    cancelledBy: row.cancelled_by ?? undefined,
    reviewed: reviewedIds.has(row.id),
    createdAt: row.created_at,
  };
}

/** Un seul aller-retour pour les 2 jeux auxiliaires (avis déposés, nombre de devis par
 * réservation), partagés par toute la page plutôt que refaits par ligne (évite le N+1). */
async function fetchAuxiliaries(): Promise<{
  reviewedIds: Set<string>;
  quotesCountById: Map<string, number>;
}> {
  const [reviewsRes, quotesRes] = await Promise.all([
    supabase.from('reviews').select('booking_id').not('booking_id', 'is', null),
    supabase.from('quotes').select('booking_id'),
  ]);
  if (reviewsRes.error) throw new ApiError(reviewsRes.error.message);
  if (quotesRes.error) throw new ApiError(quotesRes.error.message);

  const reviewedIds = new Set(reviewsRes.data.map((r) => r.booking_id as string));
  const quotesCountById = new Map<string, number>();
  for (const q of quotesRes.data) {
    quotesCountById.set(q.booking_id, (quotesCountById.get(q.booking_id) ?? 0) + 1);
  }
  return { reviewedIds, quotesCountById };
}

export async function getActiveBookingForArtisan(artisanId: string): Promise<Booking | null> {
  const all = await getBookings();
  return findActiveBookingForArtisan(all, artisanId);
}

export async function getBookings(): Promise<Booking[]> {
  const [{ data, error }, aux] = await Promise.all([
    supabase.from('bookings').select(BOOKING_SELECT).order('created_at', { ascending: false }),
    fetchAuxiliaries(),
  ]);
  if (error) throw new ApiError(error.message);
  return (data as unknown as BookingRow[]).map((row) => toBooking(row, aux.reviewedIds, aux.quotesCountById));
}

export async function getBookingById(id: string): Promise<Booking> {
  const [{ data, error }, aux] = await Promise.all([
    supabase.from('bookings').select(BOOKING_SELECT).eq('id', id).maybeSingle(),
    fetchAuxiliaries(),
  ]);
  if (error) throw new ApiError(error.message);
  if (!data) throw new ApiError('Réservation introuvable', 404);
  return toBooking(data as unknown as BookingRow, aux.reviewedIds, aux.quotesCountById);
}

/** Frais réels calculés côté serveur (vs cancellable_until) — voir supabase/functions/cancel-booking. */
export async function cancelBooking(id: string, reason?: string): Promise<Booking> {
  const { data, error } = await supabase.functions.invoke('cancel-booking', { body: { bookingId: id, reason } });
  if (error) throw new ApiError(error.message);
  return getBookingById((data as { id: string }).id);
}

/** Annule l'annulation (toast « Annuler ») : écriture directe autorisée (pas de règle de
 * transition à valider dans ce sens, contrairement à l'avancement de mission) — la seule
 * mutation de statut de ce fichier qui ne passe pas par une Edge Function, puisqu'elle ne
 * fait que défaire ce que le client venait lui-même de déclencher. */
export async function restoreBooking(id: string, previousStatus: BookingStatus): Promise<Booking> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: previousStatus, cancelled_by: null })
    .eq('id', id);
  if (error) throw new ApiError(error.message);
  await supabase.from('booking_events').delete().eq('booking_id', id).eq('type', 'cancelled');
  return getBookingById(id);
}

/** Voir supabase/functions/advance-mission-stage (décision validée : pas d'app Artisan dans
 * ce dépôt, le client déclenche toujours la transition, mais elle est désormais revalidée et
 * écrite côté serveur). */
export async function advanceMissionStage(id: string): Promise<Booking> {
  const { error } = await supabase.functions.invoke('advance-mission-stage', { body: { bookingId: id } });
  if (error) throw new ApiError(error.message);
  return getBookingById(id);
}

export async function getReportForBooking(bookingId: string): Promise<InterventionReport> {
  const [{ data: report, error: reportError }, { data: materials, error: materialsError }, { data: photos, error: photosError }] =
    await Promise.all([
      supabase.from('reports').select('*').eq('booking_id', bookingId).maybeSingle(),
      supabase.from('report_materials').select('label, qty, unit_price').eq('booking_id', bookingId),
      supabase.from('report_photos').select('phase, storage_path, caption').eq('booking_id', bookingId),
    ]);
  if (reportError) throw new ApiError(reportError.message);
  if (!report) throw new ApiError('Rapport introuvable', 404);
  if (materialsError) throw new ApiError(materialsError.message);
  if (photosError) throw new ApiError(photosError.message);

  return {
    bookingId: report.booking_id,
    status: report.status,
    startedAt: report.started_at,
    endedAt: report.ended_at,
    summary: report.summary,
    tasks: report.tasks ?? [],
    materials: (materials ?? []).map((m) => ({ label: m.label, qty: m.qty, unitPrice: m.unit_price })),
    labor: report.labor,
    travel: report.travel,
    photos: (photos ?? []).map((p, i) => ({
      id: String(i),
      phase: p.phase,
      caption: p.caption,
      url: p.storage_path ?? undefined,
    })),
    warrantyDays: report.warranty_days,
    autoValidateAt: report.auto_validate_at,
  };
}

export async function getQuotesForBooking(bookingId: string): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('id, booking_id, artisan_id, amount, message, proposed_slot, created_at')
    .eq('booking_id', bookingId);
  if (error) throw new ApiError(error.message);
  return data.map((q) => ({
    id: q.id,
    bookingId: q.booking_id,
    artisanId: q.artisan_id,
    amount: q.amount,
    message: q.message ?? undefined,
    proposedSlot: q.proposed_slot ?? undefined,
    createdAt: q.created_at,
  }));
}

export async function getBookingIdsWithReport(): Promise<string[]> {
  const { data, error } = await supabase.from('reports').select('booking_id');
  if (error) throw new ApiError(error.message);
  return data.map((r) => r.booking_id);
}

/** Accepter un devis (Lot 8 : bouton ajouté sur le détail réservation, voir le plan —
 * aucune UI n'appelait cette action côté mock). */
export async function acceptQuote(bookingId: string, quoteId: string): Promise<Booking> {
  const { error } = await supabase.functions.invoke('accept-quote', { body: { bookingId, quoteId } });
  if (error) throw new ApiError(error.message);
  return getBookingById(bookingId);
}

/** Câblée sur « Confirmer la fin de l'intervention » (jusqu'ici une simple navigation). */
export async function validateReport(bookingId: string): Promise<InterventionReport> {
  const { error } = await supabase.functions.invoke('validate-report', { body: { bookingId } });
  if (error) throw new ApiError(error.message);
  return getReportForBooking(bookingId);
}
