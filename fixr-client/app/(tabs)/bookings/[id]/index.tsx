/**
 * Détail de réservation — design/BookingDetail.dc.html.
 */
import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MissionTimeline } from '@/components/domain';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useAddresses } from '@/features/addresses/hooks';
import { useArtisan } from '@/features/artisans/hooks';
import { CANCELLATION_FEE_FCFA } from '@/features/bookings/constants';
import { CancelBookingSheet, type CancelBookingSheetRef, type CancelReason } from '@/features/bookings/components/CancelBookingSheet';
import { useBooking, useCancelBooking, useQuotesForBooking, useRestoreBooking } from '@/features/bookings/hooks';
import { deriveTimelineSteps } from '@/features/bookings/timeline';
import { useCurrentUser } from '@/features/profile/hooks';
import { formatFCFA, formatFCFARange, formatPhoneMasked, formatWeekdayDateTime, getInitials } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { BookingStatus } from '@/types/domain';

export default function BookingDetail() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.bookings;
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();

  const bookingQuery = useBooking(id);
  const artisanQuery = useArtisan(bookingQuery.data?.artisanId ?? '', Boolean(bookingQuery.data?.artisanId));
  const addressesQuery = useAddresses();
  const userQuery = useCurrentUser();
  const quotesQuery = useQuotesForBooking(id, bookingQuery.data?.status === 'quotes');

  const cancelMutation = useCancelBooking();
  const restoreMutation = useRestoreBooking();
  const sheetRef = useRef<CancelBookingSheetRef>(null);
  const [preCancelStatus, setPreCancelStatus] = useState<BookingStatus | null>(null);

  const isLoading = bookingQuery.isLoading || addressesQuery.isLoading || userQuery.isLoading;

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg px-5" style={{ paddingTop: insets.top + 16 }}>
        <Stack.Screen options={{ headerShown: true, title: t.detail.title(id) }} />
        <Skeleton height={24} width="60%" />
        <View className="h-4" />
        <Skeleton height={200} rounded={20} />
      </View>
    );
  }

  if (bookingQuery.isError || !bookingQuery.data || !addressesQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-5" style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: true, title: t.detail.title(id) }} />
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
  const steps = deriveTimelineSteps(booking.events);
  const isCancelled = booking.status === 'cancelled';

  function handleCancelConfirm(_reason: CancelReason | null) {
    setPreCancelStatus(booking.status);
    sheetRef.current?.dismiss();
    cancelMutation.mutate(
      { id },
      {
        onSuccess: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          toast.show(t.cancel.toastMessage, {
            action: {
              label: t.cancel.toastUndo,
              onPress: () => {
                if (preCancelStatus) restoreMutation.mutate({ id, previousStatus: preCancelStatus });
              },
            },
          });
        },
      },
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <Stack.Screen options={{ headerShown: true, title: t.detail.title(booking.id) }} />

      <View className="gap-2 px-5 pt-4">
        <Badge mode="status" status={booking.status} />
        <Text variant="title1" className="font-display">
          {booking.title}
        </Text>
        <Text variant="body" tone="secondary">
          {formatWeekdayDateTime(booking.slotStart)}
        </Text>
      </View>

      <View className="gap-3 px-5 pt-5">
        <Text variant="title3" className="font-display">
          {t.detail.suivi}
        </Text>
        <View className="rounded-xl border border-border-subtle bg-surface p-4">
          <MissionTimeline steps={steps} booking={booking} />
        </View>
      </View>

      {booking.status === 'quotes' && quotesQuery.data && quotesQuery.data.length > 0 ? (
        <View className="gap-3 px-5 pt-5">
          <Text variant="title3" className="font-display">
            {t.detail.quotesReceived}
          </Text>
          {quotesQuery.data.map((quote) => (
            <View key={quote.id} className="flex-row items-center justify-between rounded-xl border border-border-subtle bg-surface p-3.5">
              <Text variant="label" className="font-body-bold">
                {formatFCFA(quote.amount)}
              </Text>
              {quote.message ? (
                <Text variant="caption" tone="secondary" numberOfLines={1} className="flex-1 pl-3 text-right">
                  {quote.message}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {artisan ? (
        <View className="gap-3 px-5 pt-5">
          <View className="gap-3 rounded-xl border border-border-subtle bg-surface p-3.5">
            <View className="flex-row items-center gap-3">
              <Avatar initials={getInitials(artisan.firstName, artisan.lastName)} seed={artisan.id} size={52} />
              <View className="min-w-0 flex-1 gap-0.5">
                <View className="flex-row items-center gap-1.5">
                  <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
                    {artisan.firstName} {artisan.lastName}
                  </Text>
                  <Icon name="verified" size={14} color={colors.primary} />
                </View>
                <Text variant="caption" tone="secondary" numberOfLines={1}>
                  {artisan.trade} · ★ {artisan.rating.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} ({artisan.reviewCount}) · {artisan.neighborhood}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push(`/artisan/${artisan.id}`)}
                accessibilityRole="button"
                className="h-11 items-center justify-center px-1"
              >
                <Text variant="label" className="font-body-bold text-primary">
                  {t.detail.artisanSection.profile}
                </Text>
              </Pressable>
            </View>
            <View className="flex-row gap-2.5">
              <Button
                variant="secondary"
                size="md"
                icon="message"
                className="flex-1"
                onPress={() => router.push('/messages')}
              >
                {t.detail.artisanSection.write}
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon="call"
                className="flex-1"
                disabled={!artisan.phone}
                onPress={() => artisan.phone && void Linking.openURL(`tel:${artisan.phone}`)}
              >
                {t.detail.artisanSection.call}
              </Button>
            </View>
          </View>
        </View>
      ) : null}

      <View className="gap-3 px-5 pt-5">
        <View className="gap-4 rounded-xl border border-border-subtle bg-surface p-4">
          {userQuery.data ? (
            <View className="gap-0.5 border-b border-border-subtle pb-3">
              <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                {t.detail.details.client}
              </Text>
              <Text variant="label" className="font-body-bold">
                {userQuery.data.firstName} {userQuery.data.lastName}
              </Text>
              <Text variant="caption" tone="secondary">
                {formatPhoneMasked(userQuery.data.phone)}
              </Text>
            </View>
          ) : null}

          {address ? (
            <View className="gap-0.5 border-b border-border-subtle pb-3">
              <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                {t.detail.details.address}
              </Text>
              <Text variant="label" className="font-body-bold">
                {address.line}
              </Text>
              {address.complement || address.accessInstructions ? (
                <Text variant="caption" tone="secondary">
                  {[address.complement, address.accessInstructions].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
            </View>
          ) : null}

          {booking.description ? (
            <View className="gap-2 border-b border-border-subtle pb-3">
              <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                {t.detail.details.description}
              </Text>
              <Text variant="body" tone="secondary">
                {booking.description}
              </Text>
              {booking.media.length > 0 ? (
                <View className="flex-row gap-2">
                  {booking.media.map((m) => (
                    <View key={m.id} className="h-16 w-16 items-center justify-center rounded-xl bg-surface-muted">
                      <Icon name="photo" size={20} color={colors.textTertiary} />
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          <View className="gap-1">
            <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
              {t.detail.details.price}
            </Text>
            <Text variant="title3" className="font-display">
              {booking.priceFinal !== undefined
                ? formatFCFA(booking.priceFinal)
                : booking.priceEstimate
                  ? formatFCFARange(booking.priceEstimate.min, booking.priceEstimate.max)
                  : formatFCFA(booking.budget)}
            </Text>
          </View>
        </View>
      </View>

      <View className="gap-1 px-5 pt-5">
        {!isCancelled ? (
          <>
            <Pressable
              onPress={() => sheetRef.current?.present()}
              accessibilityRole="button"
              className="min-h-touch flex-row items-center gap-3 py-2.5"
            >
              <Icon name="cancel" size={20} color={colors.danger} />
              <Text variant="label" className="font-body-bold text-danger">
                {t.detail.cancel}
              </Text>
            </Pressable>
            {booking.cancellableUntil ? (
              <Text variant="caption" tone="secondary" className="pl-8">
                {t.detail.freeUntil(formatWeekdayDateTime(booking.cancellableUntil))}
              </Text>
            ) : null}
          </>
        ) : null}
        <Pressable
          onPress={() => toast.show(t.detail.reportIssueSent)}
          accessibilityRole="button"
          className="min-h-touch flex-row items-center gap-3 py-2.5"
        >
          <Icon name="flag" size={20} color={colors.textSecondary} />
          <Text variant="label" className="font-body-bold" tone="secondary">
            {t.detail.reportIssue}
          </Text>
        </Pressable>
      </View>

      <View className="px-5 pt-6">
        {isCancelled ? (
          <Button variant="primary" onPress={() => router.push('/request/need')}>
            {t.detail.rebook}
          </Button>
        ) : (
          <Button variant="primary" onPress={() => router.push('/messages')}>
            {artisan ? t.detail.writeTo(artisan.firstName) : t.detail.artisanSection.write}
          </Button>
        )}
      </View>

      <CancelBookingSheet
        ref={sheetRef}
        artisanFirstName={artisan?.firstName ?? "L'artisan"}
        cancellableUntil={booking.cancellableUntil ?? booking.slotStart}
        fee={CANCELLATION_FEE_FCFA}
        onConfirm={handleCancelConfirm}
        onKeep={() => sheetRef.current?.dismiss()}
      />
    </ScrollView>
  );
}
