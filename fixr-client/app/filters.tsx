/**
 * Filtres — design/Filters.dc.html. Route racine, formSheet (app/_layout.tsx) ; en-tête
 * natif désactivé ici pour reproduire l'en-tête custom de la maquette (fermer / titre /
 * Effacer), comme les écrans (auth) du Lot 2.
 */
import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { Segmented } from '@/components/ui/Segmented';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useArtisanCount } from '@/features/artisans/hooks';
import { useCategories } from '@/features/categories/hooks';
import { useFiltersStore } from '@/features/filters/store';
import { fr } from '@/lib/i18n/fr';
import type { CategoryId } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { VerificationLevel } from '@/types/domain';

const DISTANCES = [2, 5, 10, 20] as const;
const RATINGS = [3, 4, 4.5] as const;
const EXPERIENCES = [undefined, 2, 5, 10] as const;
const AVAILABILITIES = ['today', 'tomorrow', 'week', 'later'] as const;
const VERIFICATION_LEVELS: VerificationLevel[] = ['identity', 'skills', 'pro'];
const PRICE_MIN = 0;
const PRICE_MAX = 50000;

export default function Filters() {
  const t = fr.filters;
  const { colors } = useTheme();
  const categoriesQuery = useCategories();
  const { draft, setDraft, beginEdit, commitDraft, resetDraft } = useFiltersStore();
  const { count } = useArtisanCount(draft);

  useEffect(() => {
    beginEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ouverture de l'écran seulement
  }, []);

  function toggleTrade(id: CategoryId) {
    setDraft(
      'trades',
      draft.trades.includes(id) ? draft.trades.filter((t2) => t2 !== id) : [...draft.trades, id],
    );
  }

  function toggleVerification(level: VerificationLevel) {
    setDraft(
      'verificationLevels',
      draft.verificationLevels.includes(level)
        ? draft.verificationLevels.filter((l) => l !== level)
        : [...draft.verificationLevels, level],
    );
  }

  function close() {
    router.back();
  }

  function apply() {
    commitDraft();
    router.back();
  }

  return (
    <View className="flex-1 bg-surface">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between border-b border-border-subtle p-2">
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={fr.auth.common.back}
          className="h-11 w-11 items-center justify-center"
        >
          <Icon name="close" size={22} color={colors.text} />
        </Pressable>
        <Text variant="title3" className="font-display">
          {t.title}
        </Text>
        <Pressable
          onPress={resetDraft}
          accessibilityRole="button"
          className="h-11 items-center justify-center px-3"
        >
          <Text variant="label" className="font-body-bold text-primary">
            {t.clear}
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 12 }}>
        <View className="gap-3 border-b border-border-subtle py-5">
          <Text variant="label" className="font-body-extrabold">
            {t.sections.job}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {(categoriesQuery.data ?? []).map((c) => (
              <Chip
                key={c.id}
                variant={draft.trades.includes(c.id) ? 'selected' : 'default'}
                onPress={() => toggleTrade(c.id)}
              >
                {c.label}
              </Chip>
            ))}
          </View>
        </View>

        <View className="gap-3 border-b border-border-subtle py-5">
          <Text variant="label" className="font-body-extrabold">
            {t.sections.availability}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {AVAILABILITIES.map((a) => (
              <Chip
                key={a}
                variant={draft.availability === a ? 'selected' : 'default'}
                onPress={() => setDraft('availability', draft.availability === a ? undefined : a)}
              >
                {t.availability[a]}
              </Chip>
            ))}
          </View>
        </View>

        <View className="gap-3 border-b border-border-subtle py-5">
          <View className="flex-row items-baseline justify-between">
            <Text variant="label" className="font-body-extrabold">
              {t.sections.maxDistance}
            </Text>
            <Text variant="label" className="font-body-extrabold text-primary">
              {draft.maxDistanceKm !== undefined
                ? t.distanceLabel[String(draft.maxDistanceKm) as '2' | '5' | '10' | '20']
                : t.distanceLabel['20']}
            </Text>
          </View>
          <Segmented
            options={DISTANCES.map((d) => ({ value: String(d), label: t.distance[String(d) as '2' | '5' | '10' | '20'] }))}
            value={String(draft.maxDistanceKm ?? 20)}
            onChange={(v) => setDraft('maxDistanceKm', Number(v))}
          />
        </View>

        <View className="gap-3 border-b border-border-subtle py-5">
          <Text variant="label" className="font-body-extrabold">
            {t.sections.minRating}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {RATINGS.map((r) => (
              <Chip
                key={r}
                variant={draft.minRating === r ? 'selected' : 'default'}
                icon="star"
                iconColor={colors.rating}
                onPress={() => setDraft('minRating', draft.minRating === r ? undefined : r)}
              >
                {t.rating[String(r) as '3' | '4' | '4.5']}
              </Chip>
            ))}
          </View>
        </View>

        <View className="gap-3 border-b border-border-subtle py-5">
          <View className="flex-row items-baseline justify-between">
            <Text variant="label" className="font-body-extrabold">
              {t.sections.price}
            </Text>
          </View>
          <RangeSlider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={1000}
            value={[draft.priceMin ?? PRICE_MIN, draft.priceMax ?? PRICE_MAX]}
            onChange={([min, max]) => {
              setDraft('priceMin', min);
              setDraft('priceMax', max);
            }}
          />
          {/* Switch et le texte sont deux Pressable frères, pas l'un dans l'autre (voir
              TermsCheckbox.tsx) : Switch gère déjà son propre tap. */}
          <View className="min-h-touch flex-row items-center justify-between">
            <Pressable
              onPress={() => setDraft('includeOnQuote', !draft.includeOnQuote)}
              accessibilityRole="none"
              className="flex-1 justify-center gap-0.5 py-1"
            >
              <Text variant="label" className="font-body-bold">
                {t.includeOnQuote.title}
              </Text>
              <Text variant="caption" tone="secondary">
                {t.includeOnQuote.subtitle}
              </Text>
            </Pressable>
            <Switch
              value={draft.includeOnQuote}
              onValueChange={(v) => setDraft('includeOnQuote', v)}
              accessibilityLabel={t.includeOnQuote.title}
            />
          </View>
        </View>

        <View className="gap-1 border-b border-border-subtle py-5">
          <Text variant="label" className="font-body-extrabold mb-2">
            {t.sections.verification}
          </Text>
          {VERIFICATION_LEVELS.map((level) => (
            // Checkbox et le texte sont deux Pressable FRÈRES, jamais l'un dans l'autre
            // (voir features/auth/components/TermsCheckbox.tsx : un Pressable imbriqué
            // casse le bascule sur web par remontée de bulle d'événement).
            <View key={level} className="flex-row items-center gap-3 py-2">
              <Checkbox
                checked={draft.verificationLevels.includes(level)}
                onChange={() => toggleVerification(level)}
                accessibilityLabel={t.verificationLabel[level]}
              />
              <Pressable
                onPress={() => toggleVerification(level)}
                accessibilityRole="none"
                className="min-h-touch flex-1 justify-center gap-0.5"
              >
                <Text variant="label" className="font-body-bold">
                  {t.verificationLabel[level]}
                </Text>
                <Text variant="caption" tone="secondary">
                  {t.verificationHelp[level]}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View className="gap-3 py-5">
          <Text variant="label" className="font-body-extrabold">
            {t.sections.experience}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {EXPERIENCES.map((e, i) => (
              <Chip
                key={i}
                variant={draft.minExperienceYears === e ? 'selected' : 'default'}
                onPress={() => setDraft('minExperienceYears', e)}
              >
                {e === undefined ? t.experience.all : t.experience[String(e) as '2' | '5' | '10']}
              </Chip>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="flex-row gap-2.5 border-t border-border-subtle p-5">
        <Button variant="secondary" className="w-[120px]" onPress={resetDraft}>
          {t.reset}
        </Button>
        <Button variant="primary" className="flex-1" onPress={apply}>
          {t.showResults(count ?? 0)}
        </Button>
      </View>
    </View>
  );
}
