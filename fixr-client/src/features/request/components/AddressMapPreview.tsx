/**
 * Aperçu carte non interactif — design/RequestAddress.dc.html. Isolé hors de app/ (même
 * raison que src/features/results/components/ArtisanMap.tsx — react-native-maps n'a aucun
 * support web). Carte réelle sur les coordonnées de l'adresse sélectionnée plutôt qu'une
 * illustration décorative : le coût d'intégration est déjà payé depuis le Lot 3.
 */
import NativeMapView, { Marker } from 'react-native-maps';

export type AddressMapPreviewProps = {
  latitude: number;
  longitude: number;
  testID?: string;
};

export function AddressMapPreview({ latitude, longitude, testID }: AddressMapPreviewProps) {
  return (
    <NativeMapView
      testID={testID}
      style={{ flex: 1 }}
      region={{ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      pointerEvents="none"
    >
      <Marker coordinate={{ latitude, longitude }} tracksViewChanges={false} />
    </NativeMapView>
  );
}
