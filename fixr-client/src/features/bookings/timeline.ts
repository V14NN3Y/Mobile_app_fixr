/**
 * États de la timeline (« Suivi ») de BookingDetail.dc.html — dérivés des événements réels
 * de la réservation, jamais d'un index figé comme dans la maquette (`cur = 2`).
 */
import type { BookingEvent } from '@/types/domain';

export type TimelineStepState = 'done' | 'current' | 'upcoming';

export type TimelineStep = {
  type: BookingEvent['type'];
  state: TimelineStepState;
  at: string | null;
};

export function deriveTimelineSteps(events: BookingEvent[]): TimelineStep[] {
  let currentAssigned = false;
  return events.map((event) => {
    if (event.at !== null) {
      return { type: event.type, state: 'done' as const, at: event.at };
    }
    if (!currentAssigned) {
      currentAssigned = true;
      return { type: event.type, state: 'current' as const, at: null };
    }
    return { type: event.type, state: 'upcoming' as const, at: null };
  });
}
