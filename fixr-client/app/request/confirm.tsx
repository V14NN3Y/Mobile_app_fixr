/**
 * Demande — étape 4 « Confirmer » — design/RequestConfirm.dc.html. État de soumission :
 * design/StatesB.dc.html col. 1 (seule colonne pertinente de cette planche).
 */
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarStack } from '@/components/ui/Avatar';
import { Banner } from '@/components/ui/Banner';
import { Button, announceButtonState } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Icon } from '@/components/ui/Icon';
import { IndeterminateBar } from '@/components/ui/IndeterminateBar';
import { Stepper } from '@/components/ui/Stepper';
import { Text } from '@/components/ui/Text';
import { useAddresses } from '@/features/addresses/hooks';
import { useArtisan } from '@/features/artisans/hooks';
import { useCategories } from '@/features/categories/hooks';
import { useCreateBooking } from '@/features/request/hooks';
import { useRequestStore } from '@/features/request/store';
import { useAnalytics } from '@/lib/analytics';
import { formatFCFA, formatWeekdayDate } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { NOW, timeSlots } from '@/mocks/data';
import { useTheme } from '@/theme/useTheme';

function formatConfirmDate(dayOffset: number, slotIndex: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() + dayOffset);
  const slot = timeSlots[slotIndex]!;
  return `${formatWeekdayDate(d.toISOString())} · ${slot.start} – ${slot.end}`;
}

export default function RequestConfirm() {
  const insets = useSafeAreaInsets();
  const { colors, categoryTints } = useTheme();
  const t = fr.request;

  const draft = useRequestStore((s) => s.draft);
  const isDirty = useRequestStore((s) => s.isDirty);
  const reset = useRequestStore((s) => s.reset);
  const [showAbandon, setShowAbandon] = useState(false);

  const categoriesQuery = useCategories();
  const addressesQuery = useAddresses();
  const artisanQuery = useArtisan(draft.artisanId ?? '', Boolean(draft.artisanId));
  const mutation = useCreateBooking();
  const analytics = useAnalytics();

  const category = categoriesQuery.data?.find((c) => c.id === draft.categoryId);
  const address = addressesQuery.data?.find((a) => a.id === draft.addressId);

  useEffect(() => {
    if (mutation.isPending) announceButtonState(t.confirmation.submittingAnnounce);
    else if (mutation.isSuccess) announceButtonState(t.confirmation.submittedAnnounce);
    else if (mutation.isError) announceButtonState(t.confirmation.errorAnnounce);
  }, [mutation.isPending, mutation.isSuccess, mutation.isError, t.confirmation]);

  function handleClose() {
    if (mutation.isPending) return;
    if (isDirty()) setShowAbandon(true);
    else router.replace('/');
  }

  function submit() {
    mutation.mutate(draft, {
      onSuccess: (booking) => {
        analytics.capture('request_submitted', { categoryId: draft.categoryId ?? null, bookingId: booking.id });
        router.replace({ pathname: '/request/success', params: { bookingId: booking.id } });
        reset();
      },
      onError: (error) => {
        analytics.capture('request_failed', { categoryId: draft.categoryId ?? null, message: error.message });
      },
    });
  }

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />
      {mutation.isPending ? <IndeterminateBar testID="submitting-bar" /> : null}

      <View
        className="gap-3 border-b border-border-subtle bg-bg px-2 pb-3"
        style={{ paddingTop: insets.top + 8 }}
        accessibilityState={{ busy: mutation.isPending }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => !mutation.isPending && router.push('/request/date')}
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
          <Stepper steps={t.common.steps} currentIndex={3} />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 24, gap: 16 }}
      >
        <Text variant="title2" className="font-display">
          {t.confirmation.title}
        </Text>

        <View
          className="rounded-2xl border border-border-subtle bg-surface"
          style={{ opacity: mutation.isPending ? 0.55 : 1 }}
          pointerEvents={mutation.isPending ? 'none' : 'auto'}
        >
          {/* Besoin */}
          <View className="flex-row gap-3 border-b border-border-subtle p-4">
            <View
              className="h-9 w-9 items-center justify-center rounded-md"
              style={{ backgroundColor: draft.categoryId ? categoryTints[draft.categoryId].bg : colors.surfaceMuted }}
            >
              {draft.categoryId ? (
                <Icon name={draft.categoryId} size={18} color={categoryTints[draft.categoryId].ink} />
              ) : null}
            </View>
            <View className="flex-1 gap-1">
              <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                {category?.label ?? t.confirmation.sections.besoin}
              </Text>
              <Text variant="label" className="font-body-bold">
                {draft.title}
              </Text>
              {draft.description ? (
                <Text variant="caption" tone="secondary" numberOfLines={2}>
                  {draft.description}
                </Text>
              ) : null}
              {draft.media.length > 0 ? (
                <View className="flex-row gap-1.5 pt-1">
                  {draft.media.slice(0, 4).map((m) => (
                    <View key={m.id} className="h-12 w-12 items-center justify-center rounded-md bg-surface-muted">
                      <Icon
                        name={m.kind === 'video' ? 'play' : 'photo'}
                        size={18}
                        color={colors.textTertiary}
                        filled={m.kind === 'video'}
                      />
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
            <Pressable
              onPress={() => !mutation.isPending && router.push('/request/need')}
              accessibilityRole="button"
              accessibilityLabel={`${t.confirmation.edit} — ${t.confirmation.sections.besoin}`}
              className="h-11 items-center justify-center px-1"
            >
              <Text variant="label" className="font-body-bold text-primary">
                {t.confirmation.edit}
              </Text>
            </Pressable>
          </View>

          {/* Artisan */}
          <View className="flex-row gap-3 border-b border-border-subtle p-4">
            <View className="h-9 w-9 items-center justify-center rounded-md bg-surface-muted">
              <Icon name="user" size={18} color={colors.textSecondary} />
            </View>
            <View className="flex-1 gap-1">
              <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                {t.confirmation.sections.artisan}
              </Text>
              {draft.artisanId && artisanQuery.data ? (
                <View className="flex-row items-center gap-2">
                  <Text variant="label" className="font-body-bold">
                    {artisanQuery.data.firstName} {artisanQuery.data.lastName}
                  </Text>
                </View>
              ) : (
                <>
                  <Text variant="label" className="font-body-bold">
                    {t.confirmation.openSearchTitle}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {t.confirmation.openSearchSubtitle(
                      draft.categoryId ? fr.request.succes.tradePluralByCategory[draft.categoryId] : '',
                    )}
                  </Text>
                  <View className="pt-1">
                    <AvatarStack items={[{ initials: '?' }, { initials: '?' }, { initials: '?' }]} size={32} max={3} />
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Adresse */}
          <View className="flex-row gap-3 border-b border-border-subtle p-4">
            <View className="h-9 w-9 items-center justify-center rounded-md bg-surface-muted">
              <Icon name="location" size={18} color={colors.textSecondary} />
            </View>
            <View className="flex-1 gap-1">
              <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                {t.confirmation.sections.adresse}
                {address ? ` · ${address.label}` : ''}
              </Text>
              <Text variant="label" className="font-body-bold" numberOfLines={1}>
                {address?.line ?? ''}
              </Text>
              {draft.addressComplement || address?.accessInstructions ? (
                <Text variant="caption" tone="secondary" numberOfLines={1}>
                  {[draft.addressComplement, address?.accessInstructions].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={() => !mutation.isPending && router.push('/request/address')}
              accessibilityRole="button"
              accessibilityLabel={`${t.confirmation.edit} — ${t.confirmation.sections.adresse}`}
              className="h-11 items-center justify-center px-1"
            >
              <Text variant="label" className="font-body-bold text-primary">
                {t.confirmation.edit}
              </Text>
            </Pressable>
          </View>

          {/* Date & créneau */}
          <View className={`flex-row gap-3 p-4 ${draft.budget !== undefined ? 'border-b border-border-subtle' : ''}`}>
            <View className="h-9 w-9 items-center justify-center rounded-md bg-surface-muted">
              <Icon name="calendar" size={18} color={colors.textSecondary} />
            </View>
            <View className="flex-1 gap-1">
              <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                {t.confirmation.sections.date}
              </Text>
              <Text variant="label" className="font-body-bold">
                {draft.dayOffset !== undefined && draft.slotIndex !== undefined
                  ? formatConfirmDate(draft.dayOffset, draft.slotIndex)
                  : ''}
              </Text>
              <Text variant="caption" tone="secondary">
                {t.confirmation.urgencyPrefix}
                {fr.request.besoin.urgency[draft.urgency].label}
              </Text>
            </View>
            <Pressable
              onPress={() => !mutation.isPending && router.push('/request/date')}
              accessibilityRole="button"
              accessibilityLabel={`${t.confirmation.edit} — ${t.confirmation.sections.date}`}
              className="h-11 items-center justify-center px-1"
            >
              <Text variant="label" className="font-body-bold text-primary">
                {t.confirmation.edit}
              </Text>
            </Pressable>
          </View>

          {/* Budget — omis si non renseigné */}
          {draft.budget !== undefined ? (
            <View className="flex-row gap-3 p-4">
              <View className="h-9 w-9 items-center justify-center rounded-md bg-surface-muted">
                <Icon name="sliders" size={18} color={colors.textSecondary} />
              </View>
              <View className="flex-1 gap-1">
                <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                  {t.confirmation.sections.budget}
                </Text>
                <Text variant="label" className="font-body-bold">
                  {formatFCFA(draft.budget)}{' '}
                  <Text variant="caption" tone="secondary">
                    {t.confirmation.indicatedByYou}
                  </Text>
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <View
          className="gap-2.5 rounded-2xl bg-success-soft p-4"
          style={{ opacity: mutation.isPending ? 0.55 : 1 }}
        >
          <Text variant="label" className="font-body-extrabold text-success-ink">
            {t.confirmation.infoBoxTitle}
          </Text>
          {t.confirmation.infoBullets.map((bullet) => (
            <View key={bullet} className="flex-row items-start gap-2">
              <Icon name="check" size={16} color={colors.successInk} />
              <Text variant="body" className="flex-1 text-success-ink">
                {bullet}
              </Text>
            </View>
          ))}
        </View>

        {mutation.isError ? (
          <View className="gap-3">
            <Banner tone="error">{t.confirmation.submitError}</Banner>
            <Button variant="secondary" onPress={submit}>
              {t.confirmation.retry}
            </Button>
          </View>
        ) : null}
      </ScrollView>

      <View className="gap-2 border-t border-border-subtle bg-surface px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <Button variant="primary" loading={mutation.isPending} onPress={submit}>
          {mutation.isPending ? t.confirmation.submitting : t.confirmation.submit}
        </Button>
        {mutation.isPending ? (
          <Text variant="caption" tone="secondary" className="text-center" accessibilityLiveRegion="polite">
            {t.confirmation.submittingHelp}
          </Text>
        ) : (
          <Text variant="caption" tone="secondary" className="text-center">
            {t.confirmation.legal}
          </Text>
        )}
      </View>

      <ConfirmDialog
        visible={showAbandon}
        title={t.common.abandonTitle}
        confirmLabel={t.common.abandonConfirm}
        cancelLabel={t.common.abandonCancel}
        destructive
        onConfirm={() => {
          reset();
          setShowAbandon(false);
          router.replace('/');
        }}
        onCancel={() => setShowAbandon(false)}
      />
    </View>
  );
}
