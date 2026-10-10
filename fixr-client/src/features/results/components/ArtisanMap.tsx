/**
 * Carte native — design/ResultsMap.dc.html. Isolé hors de app/ (comme OnboardingPager,
 * voir son commentaire) : react-native-maps n'a aucun support web, un import — même
 * conditionnel — depuis un fichier de route casserait le bundle web. ArtisanMap.web.tsx
 * fournit le repli pour cette plateforme ; la résolution .web.tsx fonctionne ici car ce
 * fichier est importé normalement (pas scanné par le require.context d'Expo Router).
 */
import * as Haptics from 'expo-haptics';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import NativeMapView, { Marker, type Region } from 'react-native-maps';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/useTheme';
import type { Artisan } from '@/types/domain';

export type { Region };

/** Poignée minimale exposée au parent — pas l'instance MapView complète, pour rester
 * typable à l'identique côté web (voir ArtisanMap.web.tsx) sans jamais y importer
 * react-native-maps. */
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
  { artisans, initialRegion, selectedId, onSelectArtisan, onRegionChangeComplete, testID },
  ref,
) {
  const { colors } = useTheme();
  const mapRef = useRef<NativeMapView>(null);

  useImperativeHandle(
    ref,
    () => ({
      animateToRegion: (region, duration) => mapRef.current?.animateToRegion(region, duration),
    }),
    [],
  );

  const handlePress = useCallback(
    (id: string) => {
      void Haptics.selectionAsync();
      onSelectArtisan(id);
    },
    [onSelectArtisan],
  );

  return (
    <NativeMapView
      ref={mapRef}
      testID={testID}
      style={{ flex: 1 }}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      onRegionChangeComplete={onRegionChangeComplete}
    >
      {artisans.map((a) => {
        const selected = a.id === selectedId;
        return (
          <Marker
            key={a.id}
            coordinate={{ latitude: a.lat, longitude: a.lng }}
            onPress={() => handlePress(a.id)}
            tracksViewChanges={false}
            zIndex={selected ? 2 : 1}
          >
            <View
              className="flex-row items-center gap-1 rounded-full px-2.5 py-1.5"
              style={{
                backgroundColor: selected ? colors.primary : colors.surface,
                transform: [{ scale: selected ? 1.12 : 1 }],
              }}
            >
              <Icon name="star" size={12} color={colors.rating} filled />
              <Text
                variant="label"
                tone="inherit"
                style={{ color: selected ? colors.onPrimary : colors.text }}
              >
                {a.rating.toLocaleString('fr-FR', { minimumFractionDigits: 1 })}
              </Text>
            </View>
          </Marker>
        );
      })}
    </NativeMapView>
  );
});
