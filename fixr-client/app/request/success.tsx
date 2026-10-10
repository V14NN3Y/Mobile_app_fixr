/**
 * Demande — écran Succès — design/RequestSuccess.dc.html. Écran terminal : pas d'en-tête
 * ni de Stepper, pas de retour possible (headerBackVisible: false).
 */
import * as Clipboard from 'expo-clipboard';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { SuccessCheck } from '@/components/ui/SuccessCheck';
import { Text } from '@/components/ui/Text';
import { useAddresses } from '@/features/addresses/hooks';
import { useBooking } from '@/features/bookings/hooks';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

const COPIED_RESET_MS = 2500;
const ESTIMATED_RESPONSE = '~ 25 min';

export default function RequestSuccess() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.request.succes;
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  const bookingQuery = useBooking(bookingId);
  const addressesQuery = useAddresses();
  const [copied, setCopied] = useState(false);

  const booking = bookingQuery.data;
  const address = addressesQuery.data?.find((a) => a.id === booking?.addressId);
  const tradePlural = booking ? fr.request.succes.tradePluralByCategory[booking.categoryId] : '';

  async function copyId() {
    if (!booking) return;
    await Clipboard.setStringAsync(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  }

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false, headerBackVisible: false, gestureEnabled: false }} />

      {bookingQuery.isError ? (
        // Bug corrigé (Lot 7) : `!booking` servait à la fois d'état chargement ET erreur —
        // un échec de requête laissait l'écran bloqué sur un Skeleton infini, sans Banner ni
        // réessai.
        <View className="flex-1 items-center justify-center gap-4 px-6" style={{ paddingTop: insets.top }}>
          <Banner tone="error">{fr.auth.common.networkError}</Banner>
          <Button variant="primary" onPress={() => bookingQuery.refetch()}>
            {fr.auth.common.retry}
          </Button>
        </View>
      ) : !booking ? (
        <View className="flex-1 items-center justify-center gap-4 px-6" style={{ paddingTop: insets.top }}>
          <Skeleton width={104} height={104} rounded={52} />
          <Skeleton width={240} height={20} />
          <Skeleton width={180} height={16} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, alignItems: 'center', gap: 22 }}
        >
          <SuccessCheck />

          <View className="items-center gap-2">
            <Text variant="title1" className="text-center font-display">
              {t.title}
            </Text>
            <Text variant="body" tone="secondary" className="text-center">
              {t.subtitle(tradePlural, address?.neighborhood ?? '')}
            </Text>
          </View>

          <View className="w-full flex-row rounded-2xl border border-border-subtle bg-surface p-4">
            <View className="flex-1 items-center gap-1 border-r border-border-subtle">
              <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                {t.requestNumber}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <Text variant="label" className="font-body-extrabold">
                  {booking.id}
                </Text>
                <Pressable
                  onPress={copyId}
                  accessibilityRole="button"
                  accessibilityLabel={t.copyLabel(booking.id)}
                  hitSlop={8}
                  className="h-7 w-7 items-center justify-center"
                >
                  <Icon name="copy" size={16} color={colors.primary} />
                </Pressable>
              </View>
              <Text variant="caption" className="text-success-ink" accessibilityLiveRegion="polite">
                {copied ? t.copied : ' '}
              </Text>
            </View>
            <View className="flex-1 items-center gap-1">
              <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                {t.estimatedResponse}
              </Text>
              <Text variant="label" className="font-body-extrabold">
                {ESTIMATED_RESPONSE}
              </Text>
              <Text variant="caption" tone="secondary">
                {t.firstQuote}
              </Text>
            </View>
          </View>

          <View className="w-full gap-3">
            {t.steps.map((step, i) => (
              <View key={step} className="flex-row items-center gap-3">
                <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-surface-muted">
                  <Text variant="caption" className="font-body-extrabold">
                    {i + 1}
                  </Text>
                </View>
                <Text variant="body" tone="secondary" className="flex-1">
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <View className="w-full gap-2">
            <Button variant="primary" onPress={() => router.replace('/bookings')}>
              {t.follow}
            </Button>
            <Button variant="tertiary" onPress={() => router.replace('/')}>
              {t.backHome}
            </Button>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
