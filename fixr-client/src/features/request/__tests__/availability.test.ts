import { artisans, NOW, timeSlots } from '@/mocks/data';

import { countAvailableArtisans, getDayAvailability, getSlotAvailability } from '../availability';

const now = new Date(NOW);

describe('countAvailableArtisans', () => {
  it('compte plus d’artisans disponibles plomberie à J+8 qu’à J+0 (monotone)', () => {
    const day0 = countAvailableArtisans('plomberie', 0, artisans, now);
    const day8 = countAvailableArtisans('plomberie', 8, artisans, now);
    expect(day8).toBeGreaterThanOrEqual(day0);
  });

  it('est déterministe (même entrée ⇒ même résultat)', () => {
    const a = countAvailableArtisans('plomberie', 2, artisans, now);
    const b = countAvailableArtisans('plomberie', 2, artisans, now);
    expect(a).toBe(b);
  });

  it('ne compte que les artisans du métier demandé', () => {
    const count = countAvailableArtisans('serrurerie', 8, artisans, now);
    expect(count).toBeLessThanOrEqual(artisans.filter((a) => a.categories.includes('serrurerie')).length);
  });
});

describe('getDayAvailability', () => {
  it('mappe 0 → full, 1-2 → low, 3+ → ok', () => {
    expect(getDayAvailability(0)).toBe('full');
    expect(getDayAvailability(1)).toBe('low');
    expect(getDayAvailability(2)).toBe('low');
    expect(getDayAvailability(3)).toBe('ok');
  });
});

describe('getSlotAvailability', () => {
  it('marque "past" les créneaux déjà terminés aujourd’hui (NOW = 14:02)', () => {
    const morningSlot = timeSlots[0]!; // 07:00–09:00, bien avant 14:02
    expect(getSlotAvailability(6, 0, morningSlot, 0, now).past).toBe(true);
    expect(getSlotAvailability(6, 0, morningSlot, 0, now).count).toBe(0);
  });

  it('ne marque pas "past" un créneau futur aujourd’hui', () => {
    const eveningSlot = timeSlots[5]!; // 18:00–20:00, après 14:02
    expect(getSlotAvailability(6, 5, eveningSlot, 0, now).past).toBe(false);
  });

  it('ne marque jamais "past" pour un autre jour que J+0', () => {
    const morningSlot = timeSlots[0]!;
    expect(getSlotAvailability(6, 0, morningSlot, 1, now).past).toBe(false);
  });

  it('est déterministe', () => {
    const slot = timeSlots[3]!;
    const a = getSlotAvailability(6, 3, slot, 2, now);
    const b = getSlotAvailability(6, 3, slot, 2, now);
    expect(a).toEqual(b);
  });
});
