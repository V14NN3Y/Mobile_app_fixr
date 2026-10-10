import type { CategoryId } from '@/theme/tokens';
import type { VerificationLevel } from '@/types/domain';

export type AvailabilityBucket = 'today' | 'tomorrow' | 'week' | 'later';

export type ArtisanFilters = {
  trades: CategoryId[];
  availability?: AvailabilityBucket;
  maxDistanceKm?: number;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  includeOnQuote: boolean;
  verificationLevels: VerificationLevel[];
  minExperienceYears?: number;
};

export type ArtisanSort = 'relevance' | 'rating' | 'distance' | 'priceAsc';

export function createDefaultFilters(trades: CategoryId[] = []): ArtisanFilters {
  return {
    trades,
    includeOnQuote: true,
    verificationLevels: [],
  };
}
