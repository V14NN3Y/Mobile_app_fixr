/**
 * Évaluation — design/Review.dc.html.
 */
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { RatingInput } from '@/components/ui/RatingInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useArtisan } from '@/features/artisans/hooks';
import { useBooking, useReportForBooking } from '@/features/bookings/hooks';
import { useFavoritesStore } from '@/features/favorites/store';
import { useCurrentUser } from '@/features/profile/hooks';
import { useSubmitReview } from '@/features/reviews/hooks';
import { formatFCFA, formatWeekdayDate, getInitials } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { Review } from '@/types/domain';

type Criterion = keyof NonNullable<Review['criteria']>;
const CRITERIA: Criterion[] = ['punctuality', 'quality', 'communication', 'value'];

export default function WriteReview() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.bookings.review;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggleFavorite } = useFavoritesStore();

  const [rating, setRating] = useState(0);
  const [criteria, setCriteria] = useState<Record<Criterion, number>>({
    punctuality: 0,
    quality: 0,
    communication: 0,
    value: 0,
  });
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  const bookingQuery = useBooking(id);
  const artisanQuery = useArtisan(bookingQuery.data?.artisanId ?? '', Boolean(bookingQuery.data?.artisanId));
  const userQuery = useCurrentUser();
  const reportQuery = useReportForBooking(id);
  const submitMutation = useSubmitReview();

  const isLoading = bookingQuery.isLoading || userQuery.isLoading;

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg px-5" style={{ paddingTop: insets.top + 16 }}>
        <Stack.Screen options={{ headerShown: true, title: t.heading('').trim() }} />
        <Skeleton height={200} rounded={20} />
      </View>
    );
  }

  if (bookingQuery.isError || !bookingQuery.data || !userQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-5" style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: true, title: fr.bookings.title }} />
        <Banner tone="error">{fr.auth.common.networkError}</Banner>
        <Button variant="primary" onPress={() => bookingQuery.refetch()}>
          {fr.auth.common.retry}
        </Button>
      </View>
    );
  }

  const booking = bookingQuery.data;
  const artisan = artisanQuery.data;
  const user = userQuery.data;
  // Montant réellement confirmé par le rapport d'intervention (main d'œuvre + déplacement +
  // matériel) quand il existe — bien plus fiable que l'estimation posée avant la mission.
  const report = reportQuery.data;
  const reportTotal = report
    ? report.labor + report.travel + report.materials.reduce((sum, m) => sum + m.qty * m.unitPrice, 0)
    : undefined;
  const amount = formatFCFA(
    reportTotal ??
      booking.priceFinal ??
      (booking.priceEstimate ? Math.round((booking.priceEstimate.min + booking.priceEstimate.max) / 2) : undefined),
  );

  function handleSubmit() {
    if (!artisan) return;
    const authorName = `${user.firstName} ${user.lastName.charAt(0)}.`;
    const nonZeroCriteria = Object.fromEntries(
      CRITERIA.filter((key) => criteria[key] > 0).map((key) => [key, criteria[key]]),
    );
    submitMutation.mutate(
      {
        bookingId: booking.id,
        artisanId: artisan.id,
        authorName,
        rating,
        criteria: Object.keys(nonZeroCriteria).length > 0 ? nonZeroCriteria : undefined,
        text: comment.trim() || undefined,
        service: booking.title,
      },
      { onSuccess: () => setSent(true) },
    );
  }

  if (sent) {
    return (
      <View className="flex-1 bg-bg">
        <Stack.Screen options={{ headerShown: false }} />
        <View
          className="flex-1 items-center justify-center gap-4 px-7"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <View className="h-24 w-24 items-center justify-center rounded-[32px] bg-warning-soft">
            <Icon name="star" size={52} color={colors.rating} filled />
          </View>
          <Text variant="title1" className="text-center font-display">
            {t.successTitle}
          </Text>
          <Text variant="body" tone="secondary" className="text-center">
            {t.successBody(artisan?.firstName ?? '', amount)}
          </Text>
        </View>
        <View className="gap-2 px-5" style={{ paddingBottom: insets.bottom + 16 }}>
          <Button variant="primary" onPress={() => router.replace('/')}>
            {t.backHome}
          </Button>
          {artisan ? (
            <Button variant="tertiary" icon="heart" onPress={() => toggleFavorite(artisan.id)}>
              {t.addFavorite(artisan.firstName)}
            </Button>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerRight: () => (
            <Pressable onPress={() => router.replace('/')} accessibilityRole="button" hitSlop={8}>
              <Text variant="label" className="font-body-bold" tone="secondary">
                {t.laterCta}
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="items-center gap-2.5 px-7 pt-2 text-center">
          <Avatar
            initials={artisan ? getInitials(artisan.firstName, artisan.lastName) : '?'}
            seed={artisan?.id ?? booking.id}
            size={72}
          />
          <Text variant="title1" className="text-center font-display">
            {t.heading(artisan?.firstName ?? "l'artisan")}
          </Text>
          <Text variant="caption" tone="secondary">
            {booking.title} · {formatWeekdayDate(booking.slotStart)}
          </Text>
          <RatingInput
            value={rating}
            onChange={setRating}
            label={rating > 0 ? t.ratingLabels[rating] : t.ratingLabels[0]}
            testID="review-rating"
          />
        </View>

        <View className="mx-5 mt-5 gap-0 rounded-2xl border border-border-subtle bg-surface px-4">
          {CRITERIA.map((key, i) => (
            <View
              key={key}
              className={`flex-row items-center justify-between py-3 ${i < CRITERIA.length - 1 ? 'border-b border-border-subtle' : ''}`}
            >
              <Text variant="label" className="font-body-bold">
                {t.criteria[key]}
              </Text>
              <RatingInput
                value={criteria[key]}
                onChange={(n) => setCriteria((prev) => ({ ...prev, [key]: n }))}
                size={20}
              />
            </View>
          ))}
        </View>

        <View className="gap-2 px-5 pt-5">
          <View className="flex-row items-baseline justify-between">
            <Text variant="label" className="font-body-extrabold">
              {t.commentLabel}
            </Text>
            <Text variant="caption" tone="secondary">
              {t.commentOptional}
            </Text>
          </View>
          <TextField
            multiline
            numberOfLines={4}
            placeholder={t.commentPlaceholder}
            value={comment}
            onChangeText={setComment}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          className="mx-5 mt-5 min-h-[56px] flex-row items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-border-strong px-3.5"
        >
          <Icon name="photo" size={22} color={colors.primary} />
          <Text variant="label" className="font-body-extrabold text-primary">
            {t.addPhoto}
          </Text>
        </Pressable>
      </ScrollView>

      <View className="border-t border-border-subtle bg-surface px-5 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          variant="primary"
          disabled={rating === 0}
          loading={submitMutation.isPending}
          onPress={handleSubmit}
        >
          {submitMutation.isPending ? t.submitting : rating === 0 ? t.submitDisabled : t.submit}
        </Button>
      </View>
    </View>
  );
}
