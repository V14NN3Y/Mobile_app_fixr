/**
 * Liste des puces de filtres actifs — source unique partagée par ActiveFilterChips (rendu)
 * et le compteur « Filtres · N » du chip d'en-tête, pour qu'ils ne divergent jamais.
 */
import type { ArtisanFilters } from '@/features/artisans/types';
import { fr } from '@/lib/i18n/fr';

export type ActiveFilterChip = { keys: (keyof ArtisanFilters)[]; label: string };

export function buildActiveFilterChips(filters: ArtisanFilters): ActiveFilterChip[] {
  const t = fr.results;
  const chips: ActiveFilterChip[] = [];

  if (filters.availability) {
    chips.push({ keys: ['availability'], label: t.availabilityLabels[filters.availability] });
  }
  if (filters.minRating !== undefined) {
    chips.push({ keys: ['minRating'], label: `Note ${filters.minRating}+` });
  }
  if (filters.maxDistanceKm !== undefined) {
    chips.push({ keys: ['maxDistanceKm'], label: `≤ ${filters.maxDistanceKm} km` });
  }
  if (filters.minExperienceYears !== undefined) {
    chips.push({ keys: ['minExperienceYears'], label: `${filters.minExperienceYears} ans +` });
  }
  if (filters.verificationLevels.length > 0) {
    chips.push({ keys: ['verificationLevels'], label: fr.filters.sections.verification });
  }
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    chips.push({ keys: ['priceMin', 'priceMax'], label: fr.filters.sections.price });
  }

  return chips;
}
