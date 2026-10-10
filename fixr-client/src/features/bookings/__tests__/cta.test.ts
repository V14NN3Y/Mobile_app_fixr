import type { Booking } from '@/types/domain';

import { ctaForBooking } from '../cta';

function booking(overrides: Partial<Booking>): Booking {
  return { id: 'FX-1', status: 'pending', reviewed: false, etaMin: undefined, ...overrides } as Booking;
}

describe('ctaForBooking', () => {
  it('quotes → Comparer les devis vers le détail', () => {
    const cta = ctaForBooking(booking({ id: 'FX-25103', status: 'quotes' }), undefined, false);
    expect(cta).toEqual({ label: 'Comparer les devis', href: '/bookings/FX-25103' });
  });

  it('on_the_way → Suivre l’arrivée avec l’ETA, vers live', () => {
    const cta = ctaForBooking(booking({ id: 'FX-24817', status: 'on_the_way', etaMin: 12 }), undefined, false);
    expect(cta).toEqual({ label: "Suivre l'arrivée · 12 min", href: '/bookings/FX-24817/live' });
  });

  it.each(['on_site', 'in_progress'] as const)('%s → Suivre la mission vers live', (status) => {
    const cta = ctaForBooking(booking({ id: 'FX-1', status }), undefined, false);
    expect(cta).toEqual({ label: 'Suivre la mission', href: '/bookings/FX-1/live' });
  });

  it('done + non noté + rapport existant → Noter {prénom} vers le rapport', () => {
    const cta = ctaForBooking(booking({ id: 'FX-24817', status: 'done', reviewed: false }), 'Koffi', true);
    expect(cta).toEqual({ label: 'Noter Koffi', href: '/bookings/FX-24817/report' });
  });

  it('done + non noté + aucun rapport → direct vers l’évaluation (corrige la maquette)', () => {
    const cta = ctaForBooking(booking({ id: 'FX-24402', status: 'done', reviewed: false }), 'Rodrigue', false);
    expect(cta).toEqual({ label: 'Noter Rodrigue', href: '/bookings/FX-24402/review' });
  });

  it('done + déjà noté → aucune puce', () => {
    const cta = ctaForBooking(booking({ id: 'FX-23877', status: 'done', reviewed: true }), 'Hervé', false);
    expect(cta).toBeNull();
  });

  it('cancelled → Refaire une demande', () => {
    const cta = ctaForBooking(booking({ id: 'FX-23790', status: 'cancelled' }), undefined, false);
    expect(cta).toEqual({ label: 'Refaire une demande', href: '/request/need' });
  });

  it.each(['pending', 'confirmed'] as const)('%s → aucune puce', (status) => {
    expect(ctaForBooking(booking({ status }), undefined, false)).toBeNull();
  });
});
