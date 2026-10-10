/**
 * Puces de filtres actifs retirables — design/Results.dc.html (en-tête, sous le tri).
 */
import { ScrollView } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import type { ArtisanFilters } from '@/features/artisans/types';

import { buildActiveFilterChips } from '../activeFilters';

export type ActiveFilterChipsProps = {
  filters: ArtisanFilters;
  onRemove: (keys: (keyof ArtisanFilters)[]) => void;
};

export function ActiveFilterChips({ filters, onRemove }: ActiveFilterChipsProps) {
  const chips = buildActiveFilterChips(filters);
  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
    >
      {chips.map((chip) => (
        <Chip
          key={chip.keys.join('-')}
          variant="filter"
          removable
          onRemove={() => onRemove(chip.keys)}
        >
          {chip.label}
        </Chip>
      ))}
    </ScrollView>
  );
}
