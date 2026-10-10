/**
 * Disponibilité jour/créneau pour l'étape Date — design/RequestDate.dc.html. Le modèle
 * `Artisan` n'a pas de calendrier jour par jour : plutôt que copier les valeurs arbitraires
 * de la maquette, on dérive un compte réel et déterministe depuis `getAvailabilityBucket`
 * (seule source de vérité pour « aujourd'hui/demain/semaine/plus tard », déjà utilisée par
 * Filtres/Résultats au Lot 3) — jamais aléatoire : même jour + même créneau ⇒ même résultat.
 */
import { getAvailabilityBucket } from '@/features/artisans/filtering';
import type { AvailabilityBucket } from '@/features/artisans/types';
import type { Artisan } from '@/types/domain';
import type { CategoryId } from '@/theme/tokens';

export type DayAvailability = 'ok' | 'low' | 'full';
export type SlotAvailability = { count: number; past: boolean };

const EARLIEST_DAY_FOR: Record<AvailabilityBucket, number> = {
  today: 0,
  tomorrow: 1,
  week: 2,
  later: 8,
};

/** Nombre d'artisans du métier dont le bucket réel les rend disponibles à `dayOffset` ou
 * avant (monotone : une fois disponible, il le reste les jours suivants). */
export function countAvailableArtisans(
  categoryId: CategoryId,
  dayOffset: number,
  artisans: Artisan[],
  now: Date,
): number {
  return artisans.filter(
    (a) => a.categories.includes(categoryId) && EARLIEST_DAY_FOR[getAvailabilityBucket(a, now)] <= dayOffset,
  ).length;
}

export function getDayAvailability(count: number): DayAvailability {
  if (count === 0) return 'full';
  if (count <= 2) return 'low';
  return 'ok';
}

function parseTimeOnDay(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(day);
  d.setHours(h!, m, 0, 0);
  return d;
}

function isSlotEndPast(slot: { start: string; end: string }, dayOffset: number, now: Date): boolean {
  if (dayOffset !== 0) return false;
  return parseTimeOnDay(now, slot.end).getTime() <= now.getTime();
}

/** Répartition déterministe (jamais aléatoire) du total du jour sur les 6 créneaux — pic
 * milieu de matinée/après-midi, creux en soirée, pas une copie des valeurs de la maquette. */
const SLOT_WEIGHTS = [1, 1.3, 0.6, 1.4, 0.4, 0.2];

export function getSlotAvailability(
  dayCount: number,
  slotIndex: number,
  slot: { start: string; end: string },
  dayOffset: number,
  now: Date,
): SlotAvailability {
  const past = isSlotEndPast(slot, dayOffset, now);
  if (past) return { count: 0, past: true };
  const weight = SLOT_WEIGHTS[slotIndex % SLOT_WEIGHTS.length]!;
  return { count: Math.round((dayCount / 3) * weight), past: false };
}
