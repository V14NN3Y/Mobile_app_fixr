/**
 * Construction pure d'une `Booking` depuis un `RequestDraft` validé — séparée de
 * `api.ts` (qui ajoute la latence simulée et la mutation du tableau mock) pour rester
 * testable sans attendre `simulateRequest`, même discipline que `filtering.ts`/`profileState.ts`.
 */
import { timeSlots } from '@/mocks/data';
import type { Booking } from '@/types/domain';

import type { RequestDraft } from './store';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Combine un jour et un « HH:MM » en ISO avec le décalage fixe +01:00 (Africa/Porto-Novo,
 * sans heure d'été), comme le reste de mocks/data.ts. S'appuie sur les accesseurs locaux de
 * Date (getHours/getMinutes), donc suppose un environnement réglé sur ce fuseau — même
 * hypothèse déjà faite par formatShortDate/AvailabilityStrip, pas une nouvelle fragilité.
 */
export function combineDateTime(day: Date, hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(day);
  d.setHours(h!, m, 0, 0);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00+01:00`;
}

export function nextBookingId(existing: Booking[]): string {
  const max = existing.reduce((acc, b) => {
    const n = Number(b.id.replace('FX-', ''));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `FX-${max + 1}`;
}

/** `draft` doit déjà avoir passé `fullRequestSchema.safeParse` — pas de garde ici. */
export function buildBooking(draft: RequestDraft, existingBookings: Booking[], now: Date): Booking {
  const slot = timeSlots[draft.slotIndex!]!;
  const slotDate = addDays(now, draft.dayOffset!);
  const slotStart = combineDateTime(slotDate, slot.start);
  const slotEnd = combineDateTime(slotDate, slot.end);

  return {
    id: nextBookingId(existingBookings),
    status: 'pending',
    categoryId: draft.categoryId!,
    title: draft.title.trim(),
    description: draft.description.trim() || undefined,
    media: draft.media.map(({ id, kind, durationSec }) => ({ id, kind, durationSec })),
    urgency: draft.urgency,
    artisanId: draft.artisanId,
    openSearch: draft.openSearch,
    addressId: draft.addressId!,
    slotStart,
    slotEnd,
    budget: draft.budget,
    quotesCount: 0,
    events: [
      { type: 'requested', at: new Date().toISOString() },
      { type: 'artisan_found', at: null },
      { type: 'confirmed', at: null },
      { type: 'on_the_way', at: null },
      { type: 'in_progress', at: null },
      { type: 'done', at: null },
    ],
    cancellableUntil: new Date(new Date(slotStart).getTime() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
}
