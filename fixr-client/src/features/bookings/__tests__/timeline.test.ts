import { bookings } from '@/mocks/data';

import { deriveTimelineSteps } from '../timeline';

describe('deriveTimelineSteps', () => {
  it('FX-24817 (on_the_way fait, in_progress en cours, done à venir)', () => {
    const fx24817 = bookings.find((b) => b.id === 'FX-24817')!;
    const steps = deriveTimelineSteps(fx24817.events);
    const byType = Object.fromEntries(steps.map((s) => [s.type, s.state]));
    expect(byType.requested).toBe('done');
    expect(byType.artisan_found).toBe('done');
    expect(byType.confirmed).toBe('done');
    expect(byType.on_the_way).toBe('done');
    expect(byType.in_progress).toBe('current');
    expect(byType.done).toBe('upcoming');
  });

  it('FX-25103 (seul "requested" est fait) → "artisan_found" est l’étape courante', () => {
    const fx25103 = bookings.find((b) => b.id === 'FX-25103')!;
    const steps = deriveTimelineSteps(fx25103.events);
    expect(steps[0]).toMatchObject({ type: 'requested', state: 'done' });
    expect(steps[1]).toMatchObject({ type: 'artisan_found', state: 'current' });
    expect(steps.slice(2).every((s) => s.state === 'upcoming')).toBe(true);
  });

  it('FX-23790 (annulée, 2 événements seulement) → les deux sont "done", pas 6 étapes forcées', () => {
    const fx23790 = bookings.find((b) => b.id === 'FX-23790')!;
    const steps = deriveTimelineSteps(fx23790.events);
    expect(steps).toHaveLength(2);
    expect(steps.every((s) => s.state === 'done')).toBe(true);
    expect(steps.map((s) => s.type)).toEqual(['requested', 'cancelled']);
  });
});
