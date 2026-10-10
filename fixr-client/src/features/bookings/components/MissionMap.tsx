/**
 * Carte de suivi de mission — design/MissionLive.dc.html. Isolé hors de app/, même raison
 * que src/features/results/components/ArtisanMap.tsx (react-native-maps n'a aucun support
 * web). Le marqueur artisan se repositionne à chaque appel (pas d'interpolation animée via
 * AnimatedRegion/MarkerAnimated — ArtisanMap.tsx a déjà délibérément choisi ce choix plus
 * simple au Lot 3, même cohérence ici), `tracksViewChanges={false}` comme ArtisanMap.
 */
import NativeMapView, { Marker, Polyline } from 'react-native-maps';
import { View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export type MissionMapLatLng = { latitude: number; longitude: number };

export type MissionMapProps = {
  artisanPosition: MissionMapLatLng;
  clientPosition: MissionMapLatLng;
  testID?: string;
};

export function MissionMap({ artisanPosition, clientPosition, testID }: MissionMapProps) {
  const { colors } = useTheme();

  const latitudes = [artisanPosition.latitude, clientPosition.latitude];
  const longitudes = [artisanPosition.longitude, clientPosition.longitude];
  const region = {
    latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    latitudeDelta: Math.max(0.01, (Math.max(...latitudes) - Math.min(...latitudes)) * 2.2),
    longitudeDelta: Math.max(0.01, (Math.max(...longitudes) - Math.min(...longitudes)) * 2.2),
  };

  return (
    <NativeMapView testID={testID} style={{ flex: 1 }} region={region}>
      <Polyline
        coordinates={[artisanPosition, clientPosition]}
        strokeColor={colors.primary}
        strokeWidth={3}
        lineDashPattern={[8, 8]}
      />
      <Marker coordinate={clientPosition} tracksViewChanges={false} title="Chez vous">
        <View className="h-5 w-5 rounded-full border-4 border-surface bg-primary" />
      </Marker>
      <Marker coordinate={artisanPosition} tracksViewChanges={false} title="Artisan">
        <View className="h-11 w-11 items-center justify-center rounded-full border-[3px] border-surface bg-accent" />
      </Marker>
    </NativeMapView>
  );
}
