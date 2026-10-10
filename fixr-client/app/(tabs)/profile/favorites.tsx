/**
 * Favoris — pas de maquette dédiée, style de Profile.dc.html (docs/ECRANS.md). Résout
 * favoriteArtisanIds en objets Artisan[] via useAllArtisansForTrades([]) (même motif qu'aux
 * Lots 5/6 pour les cartes de réservations/conversations).
 */
import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArtisanCard } from '@/components/domain';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useAllArtisansForTrades } from '@/features/artisans/hooks';
import { useFavoritesStore } from '@/features/favorites/store';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

export default function Favorites() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.favorites;

  const artisansQuery = useAllArtisansForTrades([]);
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const favoriteArtisans = (artisansQuery.data?.items ?? []).filter((a) => favoriteIds.includes(a.id));

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className="flex-row items-center gap-1.5 border-b border-border-subtle bg-bg px-2 pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel={fr.settings.backToProfile}
          className="h-11 w-11 items-center justify-center rounded-xl"
        >
          <Icon name="chevronLeft" size={22} color={colors.text} />
        </Pressable>
        <Text variant="title2" className="font-display">
          {t.title}
        </Text>
      </View>

      {artisansQuery.isLoading ? (
        <View className="gap-3 px-5" style={{ paddingTop: 20 }}>
          <Skeleton height={76} rounded={16} />
          <Skeleton height={76} rounded={16} />
        </View>
      ) : artisansQuery.isError || !artisansQuery.data ? (
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <Banner tone="error">{t.error.title}</Banner>
          <Button variant="primary" onPress={() => artisansQuery.refetch()}>
            {t.error.retry}
          </Button>
        </View>
      ) : favoriteArtisans.length === 0 ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          <EmptyState icon="heart" title={t.empty.title} description={t.empty.description}>
            <Button variant="primary" onPress={() => router.push('/search')}>
              {t.empty.action}
            </Button>
          </EmptyState>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: insets.bottom + 24 }}>
          {favoriteArtisans.map((artisan) => (
            <View key={artisan.id} className="flex-row items-center gap-2">
              <View className="flex-1">
                <ArtisanCard
                  artisan={artisan}
                  variant="row"
                  onPress={() => router.push(`/artisan/${artisan.id}`)}
                />
              </View>
              <Pressable
                onPress={() => toggleFavorite(artisan.id)}
                accessibilityRole="button"
                accessibilityLabel={t.removeLabel(artisan.firstName)}
                className="h-11 w-11 items-center justify-center"
              >
                <Icon name="heart" size={20} color={colors.danger} filled />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
