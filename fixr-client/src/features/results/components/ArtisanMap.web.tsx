/**
 * Repli web — react-native-maps n'a aucun support navigateur (voir ArtisanMap.tsx).
 * Ne doit importer AUCUNE partie de 'react-native-maps', même pour les types : on retype
 * localement la forme minimale utilisée par ResultsMapScreen.
 */
import { forwardRef } from 'react';
import { View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { fr } from '@/lib/i18n/fr';
import type { Artisan } from '@/types/domain';

export type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

export type ArtisanMapRef = { animateToRegion: (region: Region, duration?: number) => void };

export type ArtisanMapProps = {
  artisans: Artisan[];
  initialRegion: Region;
  selectedId: string | null;
  onSelectArtisan: (id: string) => void;
  onRegionChangeComplete?: (region: Region) => void;
  testID?: string;
};

export const ArtisanMap = forwardRef<ArtisanMapRef, ArtisanMapProps>(function ArtisanMap(
  { testID },
  _ref,
) {
  return (
    <View testID={testID} className="flex-1 items-center justify-center bg-surface-muted">
      <EmptyState icon="location" title={fr.results.mapUnavailableWeb} />
    </View>
  );
});
