/**
 * Filtrage/tri des artisans — logique pure, sans React Query. Source de vérité unique
 * utilisée à la fois par l'API (Résultats) et par l'écran Filtres (compteur « Afficher N
 * artisans » en direct) : garantit qu'ils ne divergent jamais.
 */
import type { Artisan } from '@/types/domain';

import type { ArtisanFilters, ArtisanSort, AvailabilityBucket } from './types';

const MS_PER_DAY = 86_400_000;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function diffCalendarDays(from: Date, to: Date): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);
}

/** Dérive le créneau d'un artisan depuis ses données réelles (jamais depuis son id). */
export function getAvailabilityBucket(artisan: Artisan, now: Date): AvailabilityBucket {
  if (artisan.availability.today) return 'today';

  if (artisan.availability.nextSlot) {
    const days = diffCalendarDays(now, new Date(artisan.availability.nextSlot));
    if (days <= 1) return 'tomorrow';
    if (days <= 7) return 'week';
    return 'later';
  }

  const label = artisan.availability.label.toLowerCase();
  if (label.includes('demain')) return 'tomorrow';
  if (label.includes('semaine') || label.includes('samedi') || label.includes('dimanche')) {
    return 'week';
  }
  return 'later';
}

export function matchesFilters(artisan: Artisan, filters: ArtisanFilters, now: Date): boolean {
  if (filters.trades.length > 0 && !artisan.categories.some((c) => filters.trades.includes(c))) {
    return false;
  }
  if (filters.availability && getAvailabilityBucket(artisan, now) !== filters.availability) {
    return false;
  }
  if (filters.maxDistanceKm !== undefined && artisan.distanceKm > filters.maxDistanceKm) {
    return false;
  }
  if (filters.minRating !== undefined && artisan.rating < filters.minRating) {
    return false;
  }
  if (artisan.priceFrom === null) {
    if (!filters.includeOnQuote) return false;
  } else {
    if (filters.priceMin !== undefined && artisan.priceFrom < filters.priceMin) return false;
    if (filters.priceMax !== undefined && artisan.priceFrom > filters.priceMax) return false;
  }
  if (
    filters.verificationLevels.length > 0 &&
    !filters.verificationLevels.includes(artisan.verification)
  ) {
    return false;
  }
  if (
    filters.minExperienceYears !== undefined &&
    artisan.yearsExperience < filters.minExperienceYears
  ) {
    return false;
  }
  return true;
}

export function applyFilters(artisans: Artisan[], filters: ArtisanFilters, now: Date): Artisan[] {
  return artisans.filter((a) => matchesFilters(a, filters, now));
}

export function applySort(artisans: Artisan[], sort: ArtisanSort): Artisan[] {
  const sorted = [...artisans];
  switch (sort) {
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'distance':
      sorted.sort((a, b) => a.distanceKm - b.distanceKm);
      break;
    case 'priceAsc':
      sorted.sort((a, b) => {
        if (a.priceFrom === null) return b.priceFrom === null ? 0 : 1;
        if (b.priceFrom === null) return -1;
        return a.priceFrom - b.priceFrom;
      });
      break;
    case 'relevance':
    default:
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  }
  return sorted;
}

export function countArtisans(artisans: Artisan[], filters: ArtisanFilters, now: Date): number {
  return applyFilters(artisans, filters, now).length;
}
