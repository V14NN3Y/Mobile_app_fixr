/**
 * Résultats — vue carte (design/ResultsMap.dc.html).
 */
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArtisanCard } from '@/components/domain';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useArtisansForMap } from '@/features/artisans/hooks';
import { usePrimaryAddress } from '@/features/addresses/hooks';
import { useFiltersStore } from '@/features/filters/store';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { Category } from '@/types/domain';

import { buildActiveFilterChips } from '../activeFilters';
import { ArtisanMap, type ArtisanMapRef, type Region } from './ArtisanMap';

const REGION_DELTA = 0.08;
// ~110m par 0.001° de latitude : seuil de déplacement avant de proposer une nouvelle recherche.
const SEARCH_AGAIN_THRESHOLD_DEG = 0.0027;

export type ResultsMapScreenProps = {
  category: Category | undefined;
};

export function ResultsMapScreen({ category }: ResultsMapScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.results;
  const mapRef = useRef<ArtisanMapRef>(null);

  const { applied, sort } = useFiltersStore();
  const addressQuery = usePrimaryAddress();
  const mapQuery = useArtisansForMap(applied, sort);
  const artisans = mapQuery.data?.items ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchedRegion, setSearchedRegion] = useState<Region | null>(null);
  const [showSearchAgain, setShowSearchAgain] = useState(false);

  useEffect(() => {
    void Location.requestForegroundPermissionsAsync();
  }, []);

  const initialRegion: Region = useMemo(
    () =>
      addressQuery.data
        ? {
            latitude: addressQuery.data.lat,
            longitude: addressQuery.data.lng,
            latitudeDelta: REGION_DELTA,
            longitudeDelta: REGION_DELTA,
          }
        : { latitude: 6.3703, longitude: 2.3912, latitudeDelta: REGION_DELTA, longitudeDelta: REGION_DELTA },
    [addressQuery.data],
  );

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      const base = searchedRegion ?? initialRegion;
      const moved =
        Math.abs(region.latitude - base.latitude) > SEARCH_AGAIN_THRESHOLD_DEG ||
        Math.abs(region.longitude - base.longitude) > SEARCH_AGAIN_THRESHOLD_DEG;
      setShowSearchAgain(moved);
    },
    [searchedRegion, initialRegion],
  );

  const recenter = useCallback(async () => {
    try {
      const pos = await Location.getCurrentPositionAsync();
      mapRef.current?.animateToRegion(
        {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: REGION_DELTA,
          longitudeDelta: REGION_DELTA,
        },
        400,
      );
    } catch {
      mapRef.current?.animateToRegion(initialRegion, 400);
    }
  }, [initialRegion]);

  const selected = artisans.find((a) => a.id === selectedId) ?? null;

  return (
    <View className="flex-1 bg-surface-muted">
      <ArtisanMap
        ref={mapRef}
        artisans={artisans}
        initialRegion={initialRegion}
        selectedId={selectedId}
        onSelectArtisan={setSelectedId}
        onRegionChangeComplete={handleRegionChangeComplete}
      />

      <View
        className="absolute left-4 right-4 flex-row items-center gap-2.5"
        style={{ top: insets.top + 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t.backToList}
          className="h-11 w-11 items-center justify-center rounded-md bg-surface"
          style={{ shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 }}
        >
          <Icon name="chevronLeft" size={22} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="button"
          className="h-11 flex-1 flex-row items-center gap-2 rounded-md bg-surface px-3.5"
          style={{ shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 }}
        >
          <Icon name="search" size={18} color={colors.text} />
          <Text variant="label" className="font-body-bold" numberOfLines={1}>
            {category?.label ?? t.displayMode.map}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/filters')}
          accessibilityRole="button"
          accessibilityLabel={t.filtersActive(buildActiveFilterChips(applied).length)}
          className="h-11 w-11 items-center justify-center rounded-md bg-surface"
          style={{ shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 }}
        >
          <Icon name="sliders" size={20} color={colors.text} />
        </Pressable>
      </View>

      {showSearchAgain ? (
        <Pressable
          onPress={() => {
            setSearchedRegion(initialRegion);
            setShowSearchAgain(false);
            void mapQuery.refetch();
          }}
          accessibilityRole="button"
          className="absolute h-10 flex-row items-center gap-1.5 self-center rounded-full bg-ink-solid px-4"
          style={{ top: insets.top + 62 }}
        >
          <Icon name="alert" size={14} color={colors.onInkSolid} />
          <Text variant="caption" tone="inherit" className="font-body-extrabold text-on-ink-solid">
            {t.searchThisArea}
          </Text>
        </Pressable>
      ) : null}

      {mapQuery.isError ? (
        // Lot 7 : la carte s'affichait sans jamais signaler qu'aucun artisan n'avait pu être
        // chargé — aucun état chargement/erreur n'existait sur cet écran.
        <View className="absolute left-4 right-4 gap-2" style={{ top: insets.top + 62 }}>
          <Banner tone="error">{fr.auth.common.networkError}</Banner>
          <Button variant="primary" size="sm" onPress={() => mapQuery.refetch()}>
            {fr.auth.common.retry}
          </Button>
        </View>
      ) : null}

      {Platform.OS !== 'web' ? (
        <Pressable
          onPress={recenter}
          accessibilityRole="button"
          accessibilityLabel={t.recenter}
          className="absolute right-4 h-11 w-11 items-center justify-center rounded-md bg-surface"
          style={{ top: insets.top + 230, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 }}
        >
          <Icon name="crosshair" size={20} color={colors.primary} />
        </Pressable>
      ) : null}

      {selected ? (
        <View
          className="absolute left-4 right-4"
          style={{
            bottom: insets.bottom + 18,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <ArtisanCard
            artisan={selected}
            variant="floating"
            onPress={() => router.push(`/artisan/${selected.id}`)}
            onRequestPress={() =>
              router.push({ pathname: '/request/need', params: { artisanId: selected.id } })
            }
          />
        </View>
      ) : null}
    </View>
  );
}
