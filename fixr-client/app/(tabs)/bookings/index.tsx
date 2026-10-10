/**
 * Réservations — design/Bookings.dc.html. État vide : design/StatesA.dc.html col. 2.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookingCard } from '@/components/domain';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useAddresses } from '@/features/addresses/hooks';
import { useAllArtisansForTrades } from '@/features/artisans/hooks';
import { BOOKING_TABS, bucketBookingsByTab, type BookingTab } from '@/features/bookings/tabs';
import { ctaForBooking } from '@/features/bookings/cta';
import { useBookingIdsWithReport, useBookings } from '@/features/bookings/hooks';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

export default function Bookings() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.bookings;
  const [tab, setTab] = useState<BookingTab>('upcoming');

  const bookingsQuery = useBookings();
  const artisansQuery = useAllArtisansForTrades([]);
  const addressesQuery = useAddresses();
  const reportIdsQuery = useBookingIdsWithReport();

  const isLoading = bookingsQuery.isLoading || artisansQuery.isLoading || addressesQuery.isLoading;
  const isError = bookingsQuery.isError || artisansQuery.isError || addressesQuery.isError;

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top + 16 }}>
        <View className="gap-4 px-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={170} rounded={20} />
          ))}
        </View>
      </View>
    );
  }

  if (isError || !bookingsQuery.data || !addressesQuery.data) {
    return (
      <View
        className="flex-1 items-center justify-center gap-4 bg-bg px-5"
        style={{ paddingTop: insets.top }}
      >
        <Banner tone="error">{t.error.title}</Banner>
        <Button
          variant="primary"
          onPress={() => {
            void bookingsQuery.refetch();
            void artisansQuery.refetch();
            void addressesQuery.refetch();
          }}
        >
          {t.error.retry}
        </Button>
      </View>
    );
  }

  const artisans = artisansQuery.data?.items ?? [];
  const reportIds = new Set(reportIdsQuery.data ?? []);
  const buckets = bucketBookingsByTab(bookingsQuery.data);
  const activeBookings = buckets[tab];
  const totalBookings = bookingsQuery.data.length;

  return (
    <View className="flex-1 bg-bg">
      <View
        className="gap-4 border-b border-border-subtle bg-bg px-5 pb-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between">
          <Text variant="title1" className="font-display">
            {t.title}
          </Text>
          <Button variant="primary" size="sm" icon="plus" onPress={() => router.push('/request/need')}>
            {t.newCta}
          </Button>
        </View>

        <View className="flex-row" accessibilityRole="tablist">
          {BOOKING_TABS.map((tabId) => {
            const selected = tab === tabId;
            const count = buckets[tabId].length;
            return (
              <Pressable
                key={tabId}
                onPress={() => setTab(tabId)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                className="min-h-touch flex-1 items-center gap-1.5 pb-2"
              >
                <View className="flex-row items-center gap-1.5">
                  <Text
                    variant="label"
                    className={selected ? 'font-body-extrabold' : 'font-body-bold'}
                    tone={selected ? 'default' : 'secondary'}
                    numberOfLines={1}
                  >
                    {t.tabs[tabId]}
                  </Text>
                  <View
                    className="min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5"
                    style={{ backgroundColor: tabId === 'ongoing' ? colors.accentSoft : colors.surfaceMuted }}
                  >
                    <Text
                      variant="micro"
                      className="normal-case tracking-normal"
                      style={{ color: tabId === 'ongoing' ? colors.accentInk : colors.textSecondary }}
                    >
                      {count}
                    </Text>
                  </View>
                </View>
                <View
                  className="h-[2.5px] w-full rounded-full"
                  style={{ backgroundColor: selected ? colors.primary : 'transparent' }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      {totalBookings === 0 || activeBookings.length === 0 ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          <EmptyState icon="calendar" title={t.empty.title} description={t.empty.description}>
            <View className="w-full gap-2">
              <Button variant="primary" onPress={() => router.push('/request/need')}>
                {t.empty.primaryCta}
              </Button>
              <Button variant="tertiary" onPress={() => router.push('/search')}>
                {t.empty.secondaryCta}
              </Button>
            </View>
          </EmptyState>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 24 }}>
          {activeBookings.map((booking) => {
            const artisan = artisans.find((a) => a.id === booking.artisanId);
            const address = addressesQuery.data.find((a) => a.id === booking.addressId);
            const cta = ctaForBooking(booking, artisan?.firstName, reportIds.has(booking.id));
            return (
              <BookingCard
                key={booking.id}
                booking={booking}
                artisan={artisan}
                address={address}
                cta={cta}
                onPress={() => router.push(`/bookings/${booking.id}`)}
                onCtaPress={() => cta && router.push(cta.href)}
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
