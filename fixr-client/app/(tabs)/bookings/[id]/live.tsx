/**
 * Mission en direct — design/MissionLive.dc.html (sombre : MissionDark.dc.html, confirmée
 * comme une simple validation des tokens sombres, pas un état séparé). Tab bar déjà masquée
 * sur cet écran (src/components/navigation/TabBar.tsx, useHideTabBar).
 */
import * as Haptics from 'expo-haptics';
import { Linking, Pressable, Share, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stepper } from '@/components/ui/Stepper';
import { Text } from '@/components/ui/Text';
import { useAddresses } from '@/features/addresses/hooks';
import { useArtisan } from '@/features/artisans/hooks';
import { useCategories } from '@/features/categories/hooks';
import { MissionMap } from '@/features/bookings/components/MissionMap';
import { MISSION_TICK_MS } from '@/features/bookings/constants';
import { useAdvanceMissionStage, useBooking } from '@/features/bookings/hooks';
import { missionProgressIndex, stageForStatus } from '@/features/bookings/missionStage';
import { formatTime, getInitials } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

export default function MissionLive() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.bookings.live;
  const { id } = useLocalSearchParams<{ id: string }>();

  const bookingQuery = useBooking(id);
  const artisanQuery = useArtisan(bookingQuery.data?.artisanId ?? '', Boolean(bookingQuery.data?.artisanId));
  const addressesQuery = useAddresses();
  const categoriesQuery = useCategories();
  const advanceMutation = useAdvanceMissionStage();

  useEffect(() => {
    const status = bookingQuery.data?.status;
    if (!status || status === 'done' || stageForStatus(status) === null) return;
    const timer = setInterval(() => advanceMutation.mutate(id), MISSION_TICK_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- advanceMutation change de référence à chaque rendu, pas une vraie dépendance
  }, [bookingQuery.data?.status, id]);

  const isLoading = bookingQuery.isLoading || addressesQuery.isLoading || categoriesQuery.isLoading;

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: true, title: 'Mission en cours' }} />
        <Skeleton height={300} rounded={0} />
      </View>
    );
  }

  if (bookingQuery.isError || !bookingQuery.data || !addressesQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-5" style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: true, title: 'Mission en cours' }} />
        <Banner tone="error">{fr.auth.common.networkError}</Banner>
        <Button variant="primary" onPress={() => bookingQuery.refetch()}>
          {fr.auth.common.retry}
        </Button>
      </View>
    );
  }

  const booking = bookingQuery.data;
  const artisan = artisanQuery.data;
  const address = addressesQuery.data.find((a) => a.id === booking.addressId);
  const category = categoriesQuery.data?.find((c) => c.id === booking.categoryId);
  const stage = stageForStatus(booking.status) ?? 'road';

  const clientPosition = address ? { latitude: address.lat, longitude: address.lng } : { latitude: 6.3703, longitude: 2.3912 };
  // Position de départ synthétisée (pas de donnée réelle de position artisan, aucune API de
  // routage dans la liste autorisée) : décalage de quelques centaines de mètres, documenté.
  // Calcul trivial, pas besoin de useMemo (et un Hook après les retours anticipés serait
  // de toute façon invalide ici).
  const artisanPosition = { latitude: clientPosition.latitude + 0.01, longitude: clientPosition.longitude + 0.008 };

  // L'heure affichée vient de l'horodatage réel posé par advanceMissionStage sur
  // l'événement correspondant, pas de `new Date()` au rendu (sinon elle changerait à
  // chaque re-rendu sans rapport avec l'instant réel de la transition).
  const eventAt = (type: (typeof booking.events)[number]['type']) =>
    booking.events.find((e) => e.type === type)?.at ?? new Date().toISOString();

  const stageCopy =
    stage === 'road'
      ? { tag: t.road.tag, title: t.road.title, subtitle: t.road.subtitle(formatTime(booking.slotStart)) }
      : stage === 'here'
        ? { tag: t.here.tag, title: t.here.title(artisan?.firstName ?? ''), subtitle: t.here.subtitle(formatTime(eventAt('on_site'))) }
        : stage === 'work'
          ? { tag: t.work.tag, title: t.work.title, subtitle: t.work.subtitle(formatTime(eventAt('in_progress'))) }
          : { tag: t.done.tag, title: t.done.title, subtitle: t.done.subtitle };

  function handleShare() {
    void Share.share({ message: t.shareMessage(booking.id) });
  }

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="h-[340px]">
        <MissionMap artisanPosition={artisanPosition} clientPosition={clientPosition} />
      </View>

      <View className="absolute left-4 right-4 flex-row items-center gap-2.5" style={{ top: insets.top + 10 }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t.backToDetail}
          className="h-11 w-11 items-center justify-center rounded-xl bg-surface"
          style={{ shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 }}
        >
          <Icon name="chevronLeft" size={22} color={colors.text} />
        </Pressable>
        <View
          className="h-11 flex-1 items-center justify-center rounded-xl bg-surface px-3"
          style={{ shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 }}
        >
          <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
            {t.pillLabel(booking.id, category?.label ?? '')}
          </Text>
        </View>
        <Pressable
          onPress={() => void Haptics.selectionAsync()}
          accessibilityRole="button"
          accessibilityLabel={t.help}
          className="h-11 w-11 items-center justify-center rounded-xl bg-surface"
          style={{ shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 }}
        >
          <Icon name="help" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View
        className="flex-1 gap-4 rounded-t-[28px] bg-surface px-5 pt-4"
        style={{ marginTop: -24, paddingBottom: insets.bottom + 16 }}
      >
        <View className="h-1 w-10 self-center rounded-full bg-border-strong" />

        <View className="flex-row items-start justify-between">
          <View className="gap-1">
            <View className="flex-row items-center gap-1.5">
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: stage === 'done' ? colors.successInk : colors.accentInk }}
              />
              <Text
                variant="micro"
                className="normal-case tracking-normal"
                style={{ color: stage === 'done' ? colors.successInk : colors.accentInk }}
              >
                {stageCopy.tag}
              </Text>
            </View>
            <Text variant="title2" className="font-display">
              {stageCopy.title}
            </Text>
            <Text variant="caption" tone="secondary">
              {stageCopy.subtitle}
            </Text>
          </View>
        </View>

        <Stepper steps={t.progress} currentIndex={missionProgressIndex(booking.status)} />

        {(stage === 'road' || stage === 'here') && booking.missionCode ? (
          <View className="flex-row items-center gap-3 rounded-2xl bg-success-soft p-3.5">
            <Icon name="verified" size={20} color={colors.successInk} />
            <View className="flex-1 gap-0.5">
              <Text variant="caption" className="font-body-bold text-success-ink">
                {t.missionCodeLabel(artisan?.firstName ?? '')}
              </Text>
              <Text variant="title3" className="font-display text-success-ink" style={{ letterSpacing: 2 }}>
                {booking.missionCode}
              </Text>
            </View>
          </View>
        ) : null}

        {artisan ? (
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
              <Text tone="inherit" className="font-body-extrabold text-accent-ink">
                {getInitials(artisan.firstName, artisan.lastName)}
              </Text>
            </View>
            <View className="min-w-0 flex-1 gap-0.5">
              <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
                {artisan.firstName} {artisan.lastName}
              </Text>
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                ★ {artisan.rating.toLocaleString('fr-FR', { minimumFractionDigits: 1 })}
              </Text>
            </View>
            <Pressable
              onPress={() => artisan.phone && void Linking.openURL(`tel:${artisan.phone}`)}
              disabled={!artisan.phone}
              accessibilityRole="button"
              accessibilityLabel={t.backToDetail}
              className="h-12 w-12 items-center justify-center rounded-xl bg-surface-muted"
            >
              <Icon name="call" size={20} color={colors.text} />
            </Pressable>
          </View>
        ) : null}

        <Button
          variant="primary"
          onPress={() => (stage === 'done' ? router.push(`/bookings/${booking.id}/report`) : router.push('/messages'))}
        >
          {stage === 'done' ? t.viewReport : t.contactArtisan}
        </Button>

        <View className="flex-row justify-around pt-1">
          <Pressable
            onPress={() => router.push(`/bookings/${booking.id}`)}
            accessibilityRole="button"
            className="min-h-touch items-center gap-1"
          >
            <Icon name="edit" size={18} color={colors.textSecondary} />
            <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
              {t.modify}
            </Text>
          </Pressable>
          <Pressable onPress={handleShare} accessibilityRole="button" className="min-h-touch items-center gap-1">
            <Icon name="share" size={18} color={colors.textSecondary} />
            <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
              {t.share}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => void Haptics.selectionAsync()}
            accessibilityRole="button"
            className="min-h-touch items-center gap-1"
          >
            <Icon name="help" size={18} color={colors.textSecondary} />
            <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
              {t.help}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
