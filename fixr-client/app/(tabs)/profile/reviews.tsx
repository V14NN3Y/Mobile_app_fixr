/**
 * Mes avis — pas de maquette dédiée, style de Profile.dc.html (docs/ECRANS.md). Distinct du
 * flux de soumission d'avis (Lot 5, design/Review.dc.html) : ici, la liste des avis déjà
 * publiés + les réservations en attente d'un avis.
 */
import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { RatingDisplay } from '@/components/ui/RatingInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useAllArtisansForTrades } from '@/features/artisans/hooks';
import { useBookings } from '@/features/bookings/hooks';
import { useMyReviews } from '@/features/reviews/hooks';
import { formatShortDate } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

function Header() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
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
        {fr.myReviews.title}
      </Text>
    </View>
  );
}

export default function MyReviews() {
  const insets = useSafeAreaInsets();
  const t = fr.myReviews;

  const reviewsQuery = useMyReviews();
  const bookingsQuery = useBookings();
  const artisansQuery = useAllArtisansForTrades([]);

  const isLoading = reviewsQuery.isLoading || bookingsQuery.isLoading || artisansQuery.isLoading;
  const isError = reviewsQuery.isError || bookingsQuery.isError || artisansQuery.isError;

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg">
        <Stack.Screen options={{ headerShown: false }} />
        <Header />
        <View className="gap-3 px-5" style={{ paddingTop: 20 }}>
          <Skeleton height={90} rounded={20} />
          <Skeleton height={90} rounded={20} />
        </View>
      </View>
    );
  }

  if (isError || !reviewsQuery.data || !bookingsQuery.data) {
    return (
      <View className="flex-1 bg-bg">
        <Stack.Screen options={{ headerShown: false }} />
        <Header />
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <Banner tone="error">{t.error.title}</Banner>
          <Button
            variant="primary"
            onPress={() => {
              void reviewsQuery.refetch();
              void bookingsQuery.refetch();
              void artisansQuery.refetch();
            }}
          >
            {t.error.retry}
          </Button>
        </View>
      </View>
    );
  }

  const artisans = artisansQuery.data?.items ?? [];
  const pendingBookings = bookingsQuery.data.filter((b) => b.status === 'done' && !b.reviewed);
  const reviews = reviewsQuery.data;

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      {pendingBookings.length === 0 && reviews.length === 0 ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          <EmptyState icon="star" title={t.empty.title} description={t.empty.description} />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 22, paddingBottom: insets.bottom + 24 }}>
          {pendingBookings.length > 0 ? (
            <View className="gap-2.5">
              <Text variant="title3" className="font-display">
                {t.pendingTitle}
              </Text>
              {pendingBookings.map((booking) => {
                const artisan = artisans.find((a) => a.id === booking.artisanId);
                return (
                  <Pressable
                    key={booking.id}
                    onPress={() => router.push(`/bookings/${booking.id}/review`)}
                    accessibilityRole="button"
                    className="flex-row items-center justify-between rounded-2xl border border-border-subtle bg-surface p-3.5"
                  >
                    <View className="min-w-0 flex-1 gap-0.5">
                      <Text variant="label" className="font-body-bold" numberOfLines={1}>
                        {booking.title}
                      </Text>
                      <Text variant="caption" tone="secondary" numberOfLines={1}>
                        {artisan ? `${artisan.firstName} ${artisan.lastName}` : booking.id}
                      </Text>
                    </View>
                    <Text variant="caption" className="font-body-extrabold text-primary">
                      {t.pendingCta}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {reviews.length > 0 ? (
            <View className="gap-2.5">
              <Text variant="title3" className="font-display">
                {t.publishedTitle}
              </Text>
              {reviews.map((review) => {
                const artisan = artisans.find((a) => a.id === review.artisanId);
                return (
                  <View key={review.id} className="gap-1.5 rounded-2xl border border-border-subtle bg-surface p-3.5">
                    <View className="flex-row items-center justify-between">
                      <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
                        {artisan ? `${artisan.firstName} ${artisan.lastName}` : review.service}
                      </Text>
                      <Text variant="micro" tone="tertiary" className="normal-case tracking-normal">
                        {formatShortDate(review.createdAt)}
                      </Text>
                    </View>
                    <RatingDisplay value={review.rating} />
                    <Text variant="caption" tone="secondary" numberOfLines={1}>
                      {review.service}
                    </Text>
                    {review.text ? (
                      <Text variant="caption" tone="secondary">
                        {review.text}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
