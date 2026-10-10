import { NOW } from '@/mocks/data';
import type { Booking } from '@/types/domain';

import { addDays, buildBooking, combineDateTime, nextBookingId } from '../buildBooking';
import { createDefaultDraft } from '../store';

const now = new Date(NOW);

function validDraft() {
  return {
    ...createDefaultDraft(),
    categoryId: 'plomberie' as const,
    title: 'Fuite sous l’évier',
    addressId: 'a_maison',
    dayOffset: 1,
    slotIndex: 3,
  };
}

const existing: Booking[] = [
  { id: 'FX-24817' } as Booking,
  { id: 'FX-25103' } as Booking,
];

describe('nextBookingId', () => {
  it('prend le plus grand id numérique existant + 1', () => {
    expect(nextBookingId(existing)).toBe('FX-25104');
  });

  it('démarre à FX-1 sans réservation existante', () => {
    expect(nextBookingId([])).toBe('FX-1');
  });
});

describe('combineDateTime', () => {
  it('combine un jour et un HH:MM avec le décalage +01:00', () => {
    const day = new Date(2026, 8, 29); // mois 0-indexé : septembre
    expect(combineDateTime(day, '14:00')).toBe('2026-09-29T14:00:00+01:00');
  });
});

describe('addDays', () => {
  it('avance de N jours sans muter la date d’origine', () => {
    const base = new Date(now);
    const result = addDays(base, 3);
    expect(result.getTime() - base.getTime()).toBe(3 * 24 * 60 * 60 * 1000);
    expect(base.getTime()).toBe(now.getTime());
  });
});

describe('buildBooking', () => {
  it('construit une Booking complète avec un id, un statut pending et 6 événements', () => {
    const booking = buildBooking(validDraft(), existing, now);
    expect(booking.id).toBe('FX-25104');
    expect(booking.status).toBe('pending');
    expect(booking.categoryId).toBe('plomberie');
    expect(booking.title).toBe('Fuite sous l’évier');
    expect(booking.events).toHaveLength(6);
    expect(booking.events[0]).toMatchObject({ type: 'requested' });
  });

  it('omet description quand vide, garde budget quand défini', () => {
    const draft = { ...validDraft(), description: '   ', budget: 15000 };
    const booking = buildBooking(draft, existing, now);
    expect(booking.description).toBeUndefined();
    expect(booking.budget).toBe(15000);
  });

  it('cancellableUntil = créneau moins 2h', () => {
    const booking = buildBooking(validDraft(), existing, now);
    const diffMs = new Date(booking.slotStart).getTime() - new Date(booking.cancellableUntil!).getTime();
    expect(diffMs).toBe(2 * 60 * 60 * 1000);
  });
});
