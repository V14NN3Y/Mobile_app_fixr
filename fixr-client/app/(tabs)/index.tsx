/**
 * Accueil — design/Home.dc.html (sombre : HomeDark.dc.html).
 */
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArtisanCard, CategoryTile } from '@/components/domain';
import { Badge } from '@/components/ui/Badge';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { usePrimaryAddress } from '@/features/addresses/hooks';
import { useCategories } from '@/features/categories/hooks';
import { useHomeData } from '@/features/home/hooks';
import { useUnreadNotificationsCount } from '@/features/notifications/hooks';
import { useCurrentUser } from '@/features/profile/hooks';
import { formatFCFA, formatShortDate } from '@/lib/format';
import { getGreeting } from '@/lib/greeting';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { CategoryId } from '@/theme/tokens';

function HomeSkeleton() {
  return (
    <View style={{ paddingTop: 8 }} className="gap-6 px-5">
      <Skeleton height={14} width={120} />
      <Skeleton height={56} rounded={16} />
      <Skeleton height={100} rounded={20} />
      <View className="flex-row gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} width={78} height={78} rounded={16} />
        ))}
      </View>
      <Skeleton height={160} rounded={18} />
    </View>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.home;

  const userQuery = useCurrentUser();
  const addressQuery = usePrimaryAddress();
  const categoriesQuery = useCategories();
  const homeQuery = useHomeData();
  const unreadNotifications = useUnreadNotificationsCount();

  const goToCategory = useCallback((categoryId: CategoryId) => {
    router.push({ pathname: '/search/results', params: { categoryId } });
  }, []);

  const isLoading =
    userQuery.isLoading || addressQuery.isLoading || categoriesQuery.isLoading || homeQuery.isLoading;
  const isError =
    userQuery.isError || addressQuery.isError || categoriesQuery.isError || homeQuery.isError;

  const retry = useCallback(() => {
    void userQuery.refetch();
    void addressQuery.refetch();
    void categoriesQuery.refetch();
    void homeQuery.refetch();
  }, [userQuery, addressQuery, categoriesQuery, homeQuery]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        <HomeSkeleton />
      </View>
    );
  }

  if (isError || !userQuery.data || !addressQuery.data || !categoriesQuery.data || !homeQuery.data) {
    return (
      <View
        className="flex-1 bg-bg items-center justify-center gap-4 px-5"
        style={{ paddingTop: insets.top }}
      >
        <Banner tone="error">{fr.auth.common.networkError}</Banner>
        <Button variant="primary" onPress={retry}>
          {fr.auth.common.retry}
        </Button>
      </View>
    );
  }

  const user = userQuery.data;
  const address = addressQuery.data;
  const categories = categoriesQuery.data;
  const { activeMission, lastBooking, recommended, nearbyNow } = homeQuery.data;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24, gap: 26 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4 px-5">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.push('/request/address')}
            accessibilityRole="button"
            accessibilityLabel={`${t.interventionAt} ${address.neighborhood}, ${address.city}`}
            className="min-h-touch justify-center gap-0.5"
          >
            <Text variant="caption" tone="secondary">
              {t.interventionAt}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Icon name="location" size={18} color={colors.accent} />
              <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
                {address.neighborhood}, {address.city}
              </Text>
              <Icon name="chevronDown" size={16} color={colors.text} />
            </View>
          </Pressable>
          <View>
            <Button
              variant="secondary"
              size="md"
              iconOnly
              icon="alert"
              accessibilityLabel={t.notificationsLabel(unreadNotifications.data ?? 0)}
              onPress={() => router.push('/notifications')}
            />
            {unreadNotifications.data ? (
              <View className="absolute -right-1.5 -top-1.5">
                <Badge mode="count" value={unreadNotifications.data} />
              </View>
            ) : null}
          </View>
        </View>

        <View className="gap-1">
          <Text variant="label" tone="secondary">
            {getGreeting()} {t.greeting(user.firstName)}
          </Text>
          <Text variant="title1" className="font-display">
            {t.question}
          </Text>
        </View>

        <Button
          variant="secondary"
          size="lg"
          icon="search"
          className="h-14 justify-start border-border bg-surface"
          onPress={() => router.push('/search')}
        >
          {t.searchPlaceholder}
        </Button>
      </View>

      {activeMission ? (
        <Pressable
          onPress={() => router.push(`/bookings/${activeMission.booking.id}/live`)}
          accessibilityRole="button"
          accessibilityLabel={t.mission.onTheWay(activeMission.artisan.firstName)}
          className="mx-5 gap-3 rounded-2xl bg-primary p-4 active:bg-primary-pressed"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-accent-soft">
              <Text tone="inherit" className="font-body-extrabold text-accent-ink">
                {activeMission.artisan.firstName.charAt(0)}
                {activeMission.artisan.lastName.charAt(0)}
              </Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="caption" tone="inherit" className="text-primary-soft" numberOfLines={1}>
                {t.mission.inProgress(activeMission.category.label)}
              </Text>
              <Text tone="inherit" className="font-body-extrabold text-on-primary" numberOfLines={1}>
                {t.mission.onTheWay(activeMission.artisan.firstName)}
              </Text>
            </View>
            {activeMission.booking.etaMin !== undefined ? (
              <View className="items-end">
                <Text tone="inherit" variant="title2" className="font-display text-on-primary">
                  {activeMission.booking.etaMin} min
                </Text>
              </View>
            ) : null}
          </View>
          <View className="flex-row items-center justify-between">
            <Text variant="caption" tone="inherit" className="text-primary-soft" numberOfLines={1}>
              {activeMission.booking.title} · {activeMission.booking.id}
            </Text>
            <Text variant="caption" tone="inherit" className="font-body-extrabold text-on-primary">
              {t.mission.follow}
            </Text>
          </View>
        </Pressable>
      ) : null}

      <View className="gap-3">
        <View className="flex-row items-center justify-between px-5">
          <Text variant="title2" className="font-display">
            {t.sections.services}
          </Text>
          <Button variant="tertiary" size="sm" onPress={() => router.push('/search')}>
            {t.sections.seeAll}
          </Button>
        </View>
        <View className="flex-row flex-wrap gap-2.5 px-5">
          {categories.map((c) => (
            <View key={c.id} style={{ width: '22%' }}>
              <CategoryTile category={c} size="home" onPress={() => goToCategory(c.id)} />
            </View>
          ))}
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/request/need')}
        accessibilityRole="button"
        accessibilityLabel={t.describeNeed.title}
        className="mx-5 flex-row items-center gap-3.5 rounded-2xl bg-accent-soft p-4.5 active:opacity-90"
      >
        <View className="flex-1 items-start gap-1">
          <Text variant="title3" className="font-display">
            {t.describeNeed.title}
          </Text>
          <Text variant="body" tone="secondary" numberOfLines={2}>
            {t.describeNeed.subtitle}
          </Text>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-accent">
          <Icon name="plus" size={22} color={colors.onAccent} />
        </View>
      </Pressable>

      <View className="gap-3">
        <View className="flex-row items-center justify-between px-5">
          <Text variant="title2" className="font-display">
            {t.sections.recommended}
          </Text>
          <Button variant="tertiary" size="sm" onPress={() => router.push('/search/results')}>
            {t.sections.seeMore}
          </Button>
        </View>
        {recommended.length === 0 ? (
          <View className="px-5">
            <EmptyState icon="user" title={t.emptyRecommended} />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
          >
            {recommended.map((a) => (
              <ArtisanCard
                key={a.id}
                artisan={a}
                variant="compact"
                onPress={() => router.push(`/artisan/${a.id}`)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between px-5">
          <Text variant="title2" className="font-display">
            {t.sections.nearbyNow}
          </Text>
          <Button variant="tertiary" size="sm" onPress={() => router.push('/search/results?view=map')}>
            {t.sections.map}
          </Button>
        </View>
        {nearbyNow.length === 0 ? (
          <View className="px-5">
            <EmptyState icon="user" title={t.emptyNearby} />
          </View>
        ) : (
          <View className="gap-2.5 px-5">
            {nearbyNow.map((a) => (
              <ArtisanCard
                key={a.id}
                artisan={a}
                variant="row"
                onPress={() => router.push(`/artisan/${a.id}`)}
              />
            ))}
          </View>
        )}
      </View>

      {lastBooking ? (
        <View className="gap-3">
          <View className="flex-row items-center justify-between px-5">
            <Text variant="title2" className="font-display">
              {t.sections.lastBooking}
            </Text>
            <Button variant="tertiary" size="sm" onPress={() => router.push('/bookings')}>
              {t.sections.history}
            </Button>
          </View>
          <View className="mx-5 gap-3 rounded-xl border border-border-subtle bg-surface p-3.5">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-md bg-warning-soft">
                <Icon name="electricite" size={22} color={colors.warningInk} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
                  {lastBooking.booking.title}
                </Text>
                <Text variant="caption" tone="secondary" numberOfLines={1}>
                  {lastBooking.artisan
                    ? `${lastBooking.artisan.firstName} ${lastBooking.artisan.lastName} · `
                    : ''}
                  {formatShortDate(lastBooking.booking.slotStart)} ·{' '}
                  {formatFCFA(lastBooking.booking.priceFinal)}
                </Text>
              </View>
            </View>
            <Button
              variant="secondary"
              size="md"
              onPress={() =>
                router.push({
                  pathname: '/request/need',
                  params: { categoryId: lastBooking.booking.categoryId },
                })
              }
            >
              {t.bookAgain}
            </Button>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
