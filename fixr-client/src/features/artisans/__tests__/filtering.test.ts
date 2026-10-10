import { artisans } from '@/mocks/data';

import { applyFilters, applySort, getAvailabilityBucket } from '../filtering';
import { createDefaultFilters } from '../types';

const NOW = new Date('2026-09-28T14:02:00+01:00');

describe('getAvailabilityBucket', () => {
  it('renvoie "today" quand availability.today est vrai', () => {
    const koffi = artisans.find((a) => a.id === 'ar_koffi')!;
    expect(getAvailabilityBucket(koffi, NOW)).toBe('today');
  });

  it('renvoie "tomorrow" via nextSlot quand today est faux', () => {
    const fabrice = artisans.find((a) => a.id === 'ar_fabrice')!;
    expect(getAvailabilityBucket(fabrice, NOW)).toBe('tomorrow');
  });

  it('retombe sur "later" pour un artisan indisponible (unavailableUntil, pas de nextSlot)', () => {
    const bernard = artisans.find((a) => a.id === 'ar_bernard')!;
    expect(getAvailabilityBucket(bernard, NOW)).toBe('later');
  });

  it('retombe sur le libellé quand nextSlot est absent ("Cette semaine")', () => {
    const gildas = artisans.find((a) => a.id === 'ar_gildas')!;
    expect(getAvailabilityBucket(gildas, NOW)).toBe('week');
  });
});

describe('applyFilters', () => {
  it('filtre par métier (trades)', () => {
    const result = applyFilters(artisans, createDefaultFilters(['serrurerie']), NOW);
    expect(result.every((a) => a.categories.includes('serrurerie'))).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('filtre par note minimale', () => {
    const filters = { ...createDefaultFilters([]), minRating: 4.8 };
    const result = applyFilters(artisans, filters, NOW);
    expect(result.every((a) => a.rating >= 4.8)).toBe(true);
  });

  it('exclut les artisans "Sur devis" quand includeOnQuote est faux', () => {
    const filters = { ...createDefaultFilters([]), includeOnQuote: false };
    const result = applyFilters(artisans, filters, NOW);
    expect(result.every((a) => a.priceFrom !== null)).toBe(true);
  });

  it('filtre par niveau de vérification', () => {
    const filters = { ...createDefaultFilters([]), verificationLevels: ['pro'] as const };
    const result = applyFilters(artisans, { ...filters, verificationLevels: ['pro'] }, NOW);
    expect(result.every((a) => a.verification === 'pro')).toBe(true);
  });
});

describe('applySort', () => {
  it('trie par note décroissante', () => {
    const sorted = applySort(artisans, 'rating');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1]!.rating).toBeGreaterThanOrEqual(sorted[i]!.rating);
    }
  });

  it('trie par distance croissante', () => {
    const sorted = applySort(artisans, 'distance');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1]!.distanceKm).toBeLessThanOrEqual(sorted[i]!.distanceKm);
    }
  });

  it('trie par prix croissant, "Sur devis" en dernier', () => {
    const sorted = applySort(artisans, 'priceAsc');
    const nullIndex = sorted.findIndex((a) => a.priceFrom === null);
    if (nullIndex !== -1) {
      expect(sorted.slice(nullIndex).every((a) => a.priceFrom === null)).toBe(true);
    }
  });
});
