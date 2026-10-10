/**
 * Demande — étape 3 « Date » — design/RequestDate.dc.html.
 */
import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateStrip, type DateStripDay } from '@/components/domain/DateStrip';
import { SlotPicker, type SlotPickerItem } from '@/components/domain/SlotPicker';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stepper } from '@/components/ui/Stepper';
import { Text } from '@/components/ui/Text';
import {
  countAvailableArtisans,
  getDayAvailability,
  getSlotAvailability,
} from '@/features/request/availability';
import { dateStepSchema } from '@/features/request/schemas';
import { useRequestStore } from '@/features/request/store';
import { fr } from '@/lib/i18n/fr';
import { useAllArtisansForTrades } from '@/features/artisans/hooks';
import { NOW, timeSlots } from '@/mocks/data';
import { useTheme } from '@/theme/useTheme';

const SHORT_DOW = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const LONG_DOW = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const SHORT_MONTH = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];
const DAYS_SPAN = 14;

export default function RequestDate() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.request;

  const draft = useRequestStore((s) => s.draft);
  const selectDay = useRequestStore((s) => s.selectDay);
  const selectSlot = useRequestStore((s) => s.selectSlot);
  const isDirty = useRequestStore((s) => s.isDirty);
  const reset = useRequestStore((s) => s.reset);
  const [confirmAbandon, setConfirmAbandon] = useState(false);

  // Liste complète du métier choisi, pour dériver la disponibilité réelle — hook déjà
  // construit au Lot 3 pour le compteur en direct de Filtres, même besoin ici.
  const artisansQuery = useAllArtisansForTrades(draft.categoryId ? [draft.categoryId] : []);
  const now = useMemo(() => new Date(NOW), []);

  const days: DateStripDay[] = useMemo(() => {
    const artisans = artisansQuery.data?.items ?? [];
    return Array.from({ length: DAYS_SPAN }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const count = draft.categoryId
        ? countAvailableArtisans(draft.categoryId, i, artisans, now)
        : 1;
      return {
        dayOffset: i,
        dow: SHORT_DOW[d.getDay()]!,
        num: String(d.getDate()),
        availability: getDayAvailability(count),
      };
    });
  }, [now, draft.categoryId, artisansQuery.data]);
  const artisans = artisansQuery.data?.items ?? [];

  const selectedDay = days.find((d) => d.dayOffset === draft.dayOffset);
  const dayCountForSelected =
    draft.categoryId && draft.dayOffset !== undefined
      ? countAvailableArtisans(draft.categoryId, draft.dayOffset, artisans, now)
      : 0;

  const slots: SlotPickerItem[] = useMemo(() => {
    if (draft.dayOffset === undefined) return [];
    return timeSlots.map((slot, i) => {
      const { count, past } = getSlotAvailability(
        dayCountForSelected,
        i,
        slot,
        draft.dayOffset!,
        now,
      );
      const statusLabel = past
        ? t.date.slotStatus.past
        : count === 0
          ? t.date.slotStatus.full
          : count === 1
            ? t.date.slotStatus.last
            : t.date.slotStatus.n(count);
      return {
        start: slot.start,
        end: slot.end,
        label: `${slot.start} – ${slot.end}`,
        statusLabel,
        disabled: past || count === 0,
        warning: count === 1,
      };
    });
  }, [draft.dayOffset, dayCountForSelected, now, t.date.slotStatus]);

  const selectedSlot = draft.slotIndex !== undefined ? timeSlots[draft.slotIndex] : undefined;
  const canContinue = dateStepSchema.safeParse(draft).success;

  const recap = selectedDay
    ? `${selectedDay.dow}. ${selectedDay.num} · ${selectedSlot ? `${selectedSlot.start} – ${selectedSlot.end}` : '—'}`
    : '—';

  function dayLong(dayOffset: number): string {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    return `${LONG_DOW[d.getDay()]} ${d.getDate()}${d.getDate() === 1 ? 'er' : ''} ${SHORT_MONTH[d.getMonth()]}`;
  }

  function handleClose() {
    if (isDirty()) setConfirmAbandon(true);
    else router.replace('/');
  }

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="gap-3 border-b border-border-subtle bg-bg px-2 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.push('/request/address')}
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
          <Stepper steps={t.common.steps} currentIndex={2} />
        </View>
      </View>

      {artisansQuery.isLoading ? (
        <View className="flex-1 gap-4 px-5" style={{ paddingTop: 20 }}>
          <Skeleton height={24} width="40%" />
          <Skeleton height={84} rounded={16} />
          <Skeleton height={200} rounded={20} />
        </View>
      ) : artisansQuery.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <Banner tone="error">{fr.auth.common.networkError}</Banner>
          <Button variant="primary" onPress={() => artisansQuery.refetch()}>
            {fr.auth.common.retry}
          </Button>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 24, gap: 20 }}
          >
            <Text variant="title2" className="font-display">
              {t.date.title}
            </Text>

            <View className="flex-row gap-2" accessibilityRole="radiogroup">
              <Pressable
                onPress={() => selectDay(0)}
                accessibilityRole="radio"
                accessibilityState={{ checked: draft.dayOffset === 0 }}
                className={`h-12 flex-1 items-center justify-center rounded-xl ${draft.dayOffset === 0 ? 'bg-text' : 'border border-border bg-surface'}`}
              >
                <Text
                  variant="label"
                  className={`font-body-bold ${draft.dayOffset === 0 ? 'text-bg' : ''}`}
                >
                  {t.date.quick.today}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => selectDay(1)}
                accessibilityRole="radio"
                accessibilityState={{ checked: draft.dayOffset === 1 }}
                className={`h-12 flex-1 items-center justify-center rounded-xl ${draft.dayOffset === 1 ? 'bg-text' : 'border border-border bg-surface'}`}
              >
                <Text
                  variant="label"
                  className={`font-body-bold ${draft.dayOffset === 1 ? 'text-bg' : ''}`}
                >
                  {t.date.quick.tomorrow}
                </Text>
              </Pressable>
              <Pressable
                // « Autre date » : saute au premier jour au-delà de Demain plutôt que de
                // reproduire le +3 jours arbitraire codé en dur dans la maquette (sans
                // signification réelle) ; no-op si déjà sur un tel jour.
                onPress={() => {
                  if (draft.dayOffset === undefined || draft.dayOffset < 2) selectDay(2);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: (draft.dayOffset ?? 0) >= 2 }}
                className={`h-12 flex-1 items-center justify-center rounded-xl ${(draft.dayOffset ?? 0) >= 2 ? 'bg-text' : 'border border-border bg-surface'}`}
              >
                <Text
                  variant="label"
                  className={`font-body-bold ${(draft.dayOffset ?? 0) >= 2 ? 'text-bg' : ''}`}
                >
                  {t.date.quick.other}
                </Text>
              </Pressable>
            </View>

            <DateStrip days={days} selectedOffset={draft.dayOffset} onSelect={selectDay} />

            {draft.dayOffset !== undefined ? (
              <View className="gap-3">
                <Text variant="label" className="font-body-extrabold">
                  {t.date.slotsHeading(dayLong(draft.dayOffset))}
                </Text>
                <SlotPicker slots={slots} selectedIndex={draft.slotIndex} onSelect={selectSlot} />
              </View>
            ) : null}

            <View className="flex-row gap-3 rounded-2xl bg-primary-soft p-3.5">
              <Icon name="alert" size={20} color={colors.primary} />
              <Text variant="body" className="flex-1 text-primary">
                {t.date.infoBanner}
              </Text>
            </View>
          </ScrollView>

          <View
            className="gap-3 border-t border-border-subtle bg-surface px-5 pt-3"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <View className="flex-row items-center gap-2" accessibilityLiveRegion="polite">
              <Icon name="calendar" size={16} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">
                {t.date.recapLabel} ·{' '}
                <Text variant="caption" className="font-body-bold">
                  {recap}
                </Text>
              </Text>
            </View>
            <Button
              variant="primary"
              disabled={!canContinue}
              icon={canContinue ? 'chevronRight' : undefined}
              onPress={() => router.push('/request/confirm')}
            >
              {canContinue ? t.common.continueCta : t.date.continueDisabled}
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
    </View>
  );
}
