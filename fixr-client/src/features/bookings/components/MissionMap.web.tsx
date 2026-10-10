/**
 * Repli web — react-native-maps n'a aucun support navigateur (voir MissionMap.tsx).
 * Ne doit importer AUCUNE partie de 'react-native-maps', même pour les types.
 */
import { View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { fr } from '@/lib/i18n/fr';

export type MissionMapLatLng = { latitude: number; longitude: number };

export type MissionMapProps = {
  artisanPosition: MissionMapLatLng;
  clientPosition: MissionMapLatLng;
  testID?: string;
};

export function MissionMap({ testID }: MissionMapProps) {
  return (
    <View testID={testID} className="flex-1 items-center justify-center bg-surface-muted">
      <EmptyState icon="location" title={fr.bookings.live.mapUnavailableWeb} />
    </View>
  );
}
