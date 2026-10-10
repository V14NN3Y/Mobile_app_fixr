/**
 * Étape de mission en direct — design/MissionLive.dc.html. Dérivée du statut réel de la
 * réservation (pas d'un compteur de tick local comme dans la maquette), et table de
 * transition utilisée par `advanceMissionStage` (features/bookings/api.ts) pour faire
 * progresser la mission côté faux API.
 */
import type { Booking, BookingEvent, BookingStatus } from '@/types/domain';

export type MissionStage = 'road' | 'here' | 'work' | 'done';

const STAGE_FOR_STATUS: Partial<Record<BookingStatus, MissionStage>> = {
  on_the_way: 'road',
  on_site: 'here',
  in_progress: 'work',
  done: 'done',
};

export function stageForStatus(status: BookingStatus): MissionStage | null {
  return STAGE_FOR_STATUS[status] ?? null;
}

export const MISSION_PROGRESS_STEPS = ['Confirmée', 'En route', 'Sur place', 'Travaux', 'Terminé'] as const;

const PROGRESS_INDEX_FOR_STATUS: Partial<Record<BookingStatus, number>> = {
  confirmed: 0,
  on_the_way: 1,
  on_site: 2,
  in_progress: 3,
  done: 4,
};

export function missionProgressIndex(status: BookingStatus): number {
  return PROGRESS_INDEX_FOR_STATUS[status] ?? 0;
}

export type NextMissionTransition = { status: BookingStatus; eventType: BookingEvent['type'] } | null;

const TRANSITIONS: Partial<Record<BookingStatus, NextMissionTransition>> = {
  on_the_way: { status: 'on_site', eventType: 'on_site' },
  on_site: { status: 'in_progress', eventType: 'in_progress' },
  in_progress: { status: 'done', eventType: 'done' },
};

/** Prochaine transition de la simulation de mission ; `null` si rien à faire (déjà 'done'
 * ou statut non pertinent pour une mission en direct). */
export function nextMissionTransition(status: BookingStatus): NextMissionTransition {
  return TRANSITIONS[status] ?? null;
}

export function isMissionActive(booking: Pick<Booking, 'status'>): boolean {
  return stageForStatus(booking.status) !== null && booking.status !== 'done';
}
