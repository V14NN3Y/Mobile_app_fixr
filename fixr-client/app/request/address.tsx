/**
 * Demande — étape 2 « Adresse » — design/RequestAddress.dc.html.
 */
import * as Location from 'expo-location';
import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Icon } from '@/components/ui/Icon';
import { Radio } from '@/components/ui/Radio';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stepper } from '@/components/ui/Stepper';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useAddresses } from '@/features/addresses/hooks';
import { AddressMapPreview } from '@/features/request/components/AddressMapPreview';
import { addressStepSchema } from '@/features/request/schemas';
import { useRequestStore } from '@/features/request/store';
import { useAnalytics } from '@/lib/analytics';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export default function RequestAddress() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.request;

  const draft = useRequestStore((s) => s.draft);
  const setField = useRequestStore((s) => s.setField);
  const isDirty = useRequestStore((s) => s.isDirty);
  const reset = useRequestStore((s) => s.reset);
  const analytics = useAnalytics();

  const addressesQuery = useAddresses();
  const [query, setQuery] = useState('');
  const [gps, setGps] = useState<{ latitude: number; longitude: number } | null>(null);
  const [confirmAbandon, setConfirmAbandon] = useState(false);

  useEffect(() => {
    void Location.requestForegroundPermissionsAsync();
  }, []);

  const filtered = useMemo(() => {
    const addresses = addressesQuery.data ?? [];
    const nq = normalize(query.trim());
    if (!nq) return addresses;
    return addresses.filter((a) =>
      [a.label, a.line, a.neighborhood].some((s) => normalize(s).includes(nq)),
    );
  }, [addressesQuery.data, query]);
  const addresses = addressesQuery.data ?? [];

  const selectedAddress = addresses.find((a) => a.id === draft.addressId);
  const previewPoint =
    gps ??
    (selectedAddress ? { latitude: selectedAddress.lat, longitude: selectedAddress.lng } : null);

  const canContinue = addressStepSchema.safeParse(draft).success;

  function handleClose() {
    if (isDirty()) setConfirmAbandon(true);
    else router.replace('/');
  }

  async function useCurrentPosition() {
    try {
      const pos = await Location.getCurrentPositionAsync();
      setGps({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch {
      // Refus ou échec silencieux : repli sur la sélection manuelle, pas de plantage.
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="gap-3 border-b border-border-subtle bg-bg px-2 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.push('/request/need')}
            accessibilityRole="button"
            accessibilityLabel={fr.auth.common.back}
            className="h-11 w-11 items-center justify-center"
          >
            <Icon name="chevronLeft" size={22} color={colors.text} />
          </Pressable>
          <Text variant="label" className="font-body-extrabold">
            {t.common.newRequestTitle}
          </Text>
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel={t.common.cancelLabel}
            className="h-11 w-11 items-center justify-center"
          >
            <Icon name="close" size={22} color={colors.text} />
          </Pressable>
        </View>
        <View className="px-3">
          <Stepper steps={t.common.steps} currentIndex={1} />
        </View>
      </View>

      {addressesQuery.isLoading ? (
        <View className="flex-1 gap-4 px-5" style={{ paddingTop: 20 }}>
          <Skeleton height={24} width="50%" />
          <Skeleton height={52} rounded={14} />
          <Skeleton height={80} rounded={16} />
          <Skeleton height={80} rounded={16} />
        </View>
      ) : addressesQuery.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <Banner tone="error">{fr.auth.common.networkError}</Banner>
          <Button variant="primary" onPress={() => addressesQuery.refetch()}>
            {fr.auth.common.retry}
          </Button>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 24, gap: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text variant="title2" className="font-display">
              {t.adresse.title}
            </Text>

            <TextField
              value={query}
              onChangeText={setQuery}
              placeholder={t.adresse.searchPlaceholder}
              icon="search"
              accessibilityLabel={t.adresse.searchPlaceholder}
              autoCorrect={false}
            />

            <Pressable
              onPress={useCurrentPosition}
              accessibilityRole="button"
              className="min-h-touch flex-row items-center gap-3"
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
                <Icon name="crosshair" size={20} color={colors.primary} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text variant="label" className="font-body-extrabold text-primary">
                  {t.adresse.useGps}
                </Text>
                <Text variant="caption" tone="secondary">
                  {gps
                    ? t.adresse.gpsDetected(addresses[0]?.neighborhood ?? '')
                    : t.adresse.gpsApprox(addresses[0]?.neighborhood ?? '')}
                </Text>
              </View>
            </Pressable>

            {previewPoint ? (
              <View className="h-32 overflow-hidden rounded-2xl">
                <AddressMapPreview
                  latitude={previewPoint.latitude}
                  longitude={previewPoint.longitude}
                />
              </View>
            ) : null}

            <View className="gap-2">
              <Text variant="label" className="font-body-extrabold">
                {t.adresse.savedLabel}
              </Text>
              {filtered.map((a) => {
                const selected = draft.addressId === a.id;
                return (
                  <View
                    key={a.id}
                    className="min-h-[60px] flex-row items-center gap-3 rounded-2xl border px-3.5 py-2.5"
                    style={{ borderColor: selected ? colors.primary : colors.border }}
                  >
                    <Radio selected={selected} onSelect={() => setField('addressId', a.id)} />
                    <Pressable
                      onPress={() => setField('addressId', a.id)}
                      accessibilityRole="none"
                      className="min-h-touch flex-1 justify-center gap-0.5"
                    >
                      <Text variant="label" className="font-body-bold">
                        {a.label}
                      </Text>
                      <Text variant="caption" tone="secondary" numberOfLines={1}>
                        {a.line}
                      </Text>
                      {a.landmark ? (
                        <Text variant="caption" tone="secondary" numberOfLines={1}>
                          {a.landmark}
                        </Text>
                      ) : null}
                    </Pressable>
                  </View>
                );
              })}
              <Pressable
                onPress={() => router.push('/profile/addresses')}
                accessibilityRole="button"
                className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-border-strong"
              >
                <Icon name="plus" size={18} color={colors.primary} />
                <Text variant="label" className="font-body-bold text-primary">
                  {t.adresse.addNew}
                </Text>
              </Pressable>
            </View>

            <TextField
              label={`${t.adresse.complementLabel} · ${t.adresse.complementOptional}`}
              value={draft.addressComplement}
              onChangeText={(v) => setField('addressComplement', v)}
            />

            <TextField
              label={t.adresse.accessLabel}
              hint={t.adresse.accessHint}
              value={draft.addressAccessInstructions}
              onChangeText={(v) => setField('addressAccessInstructions', v)}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          <View
            className="border-t border-border-subtle bg-surface px-5 pt-3"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <Button
              variant="primary"
              disabled={!canContinue}
              icon={canContinue ? 'chevronRight' : undefined}
              onPress={() => {
                analytics.capture('request_step_completed', { step: 'address' });
                router.push('/request/date');
              }}
            >
              {canContinue ? t.common.continueCta : t.adresse.continueDisabled}
            </Button>
          </View>
        </>
      )}

      <ConfirmDialog
        visible={confirmAbandon}
        title={t.common.abandonTitle}
        confirmLabel={t.common.abandonConfirm}
        cancelLabel={t.common.abandonCancel}
        destructive
        onConfirm={() => {
          reset();
          setConfirmAbandon(false);
          router.replace('/');
        }}
        onCancel={() => setConfirmAbandon(false)}
      />
    </KeyboardAvoidingView>
  );
}
