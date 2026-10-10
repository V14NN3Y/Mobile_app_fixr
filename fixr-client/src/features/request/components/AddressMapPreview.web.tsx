/**
 * Repli web — react-native-maps n'a aucun support navigateur (voir AddressMapPreview.tsx).
 * Ne doit importer AUCUNE partie de 'react-native-maps', même pour les types.
 */
import { View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { fr } from '@/lib/i18n/fr';

export type AddressMapPreviewProps = {
  latitude: number;
  longitude: number;
  testID?: string;
};

export function AddressMapPreview({ testID }: AddressMapPreviewProps) {
  return (
    <View testID={testID} className="flex-1 items-center justify-center bg-surface-muted">
      <EmptyState icon="location" title={fr.results.mapUnavailableWeb} />
    </View>
  );
}
