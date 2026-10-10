/**
 * Recherche — design/Search.dc.html.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryTile } from '@/components/domain';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { usePrimaryAddress } from '@/features/addresses/hooks';
import { useCategories } from '@/features/categories/hooks';
import { usePopularSearches, useSearchSuggestions } from '@/features/search/hooks';
import { useSearchHistoryStore } from '@/features/search/store';
import type { SearchMode, Suggestion } from '@/features/search/suggestions';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

const SUGGESTION_ICON = { service: 'sliders', artisan: 'user', lieu: 'location' } as const;

const MODES: SearchMode[] = ['tout', 'service', 'artisan', 'lieu'];

export default function Search() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.search;

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('tout');

  const categoriesQuery = useCategories();
  const popularQuery = usePopularSearches();
  const addressQuery = usePrimaryAddress();
  const { suggestions } = useSearchSuggestions(query, mode);
  const { history, add, remove, clear } = useSearchHistoryStore();

  const hasQuery = query.trim().length > 0;
  const noMatch = hasQuery && suggestions.length === 0;

  function goToSuggestion(s: Suggestion) {
    if (s.kind === 'artisan' && s.artisanId) {
      router.push(`/artisan/${s.artisanId}`);
      return;
    }
    const category = categoriesQuery.data?.find((c) => c.label === s.label);
    add({ label: s.label, where: addressQuery.data ? `${addressQuery.data.neighborhood}, ${addressQuery.data.city}` : '' });
    router.push({
      pathname: '/search/results',
      params: category ? { categoryId: category.id } : {},
    });
  }

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top + 8 }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24, gap: 22 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="title1" className="font-display">
          {t.title}
        </Text>

        <View className="gap-3">
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder={t.placeholder[mode]}
            icon="search"
            accessibilityLabel={t.inputLabel}
            autoCorrect={false}
            returnKeyType="search"
            accessory={
              hasQuery ? (
                <Pressable
                  onPress={() => setQuery('')}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t.clear}
                >
                  <Icon name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              ) : undefined
            }
          />
          <View className="flex-row gap-2" accessibilityRole="radiogroup">
            {MODES.map((m) => (
              <Chip
                key={m}
                variant={mode === m ? 'selected' : 'default'}
                onPress={() => setMode(m)}
                testID={`search-mode-${m}`}
              >
                {t.modes[m]}
              </Chip>
            ))}
          </View>
          {addressQuery.data ? (
            <Pressable
              onPress={() => router.push('/request/address')}
              accessibilityRole="button"
              className="min-h-touch flex-row items-center gap-2"
            >
              <Icon name="location" size={18} color={colors.accent} />
              <Text variant="caption" tone="secondary">
                {t.around}{' '}
                <Text variant="caption" className="font-body-bold">
                  {addressQuery.data.neighborhood}, {addressQuery.data.city}
                </Text>
                {' · '}
                <Text variant="caption" className="font-body-extrabold text-primary">
                  {t.change}
                </Text>
              </Text>
            </Pressable>
          ) : null}
        </View>

        {hasQuery ? (
          <View className="gap-1">
            {suggestions.map((s, i) => (
              <Pressable
                key={`${s.kind}-${s.label}-${i}`}
                onPress={() => goToSuggestion(s)}
                accessibilityRole="button"
                className="min-h-[52px] flex-row items-center gap-3 border-b border-border-subtle"
              >
                <View className="h-10 w-10 items-center justify-center rounded-md bg-surface-muted">
                  <Icon name={SUGGESTION_ICON[s.kind]} size={20} color={colors.textSecondary} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text variant="label" className="font-body-bold" numberOfLines={1}>
                    {s.label}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {t.kinds[s.kind]}
                  </Text>
                </View>
                <Icon name="chevronRight" size={18} color={colors.textTertiary} />
              </Pressable>
            ))}
            {noMatch ? (
              <EmptyState
                icon="search"
                title={t.noResult(query)}
                description={t.noResultHint}
                action={{ label: t.describeNeed, onPress: () => router.push('/request/need') }}
              />
            ) : null}
          </View>
        ) : (
          <>
            <View className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                  {t.recent}
                </Text>
                {history.length > 0 ? (
                  <Pressable
                    onPress={clear}
                    accessibilityRole="button"
                    className="min-h-touch items-center justify-center px-1"
                  >
                    <Text variant="label" className="font-body-bold text-primary">
                      {t.clearHistory}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              {history.length === 0 ? (
                <Text variant="body" tone="secondary">
                  {t.noRecent}
                </Text>
              ) : (
                history.map((h, i) => (
                  <View
                    key={`${h.label}-${i}`}
                    className="min-h-[52px] flex-row items-center gap-3"
                  >
                    <Pressable
                      onPress={() => router.push('/search/results')}
                      accessibilityRole="button"
                      className="min-h-touch flex-1 flex-row items-center gap-3"
                    >
                      <View className="h-10 w-10 items-center justify-center rounded-md bg-surface-muted">
                        <Icon name="clock" size={18} color={colors.textSecondary} />
                      </View>
                      <View className="gap-0.5">
                        <Text variant="label" className="font-body-bold">
                          {h.label}
                        </Text>
                        <Text variant="caption" tone="secondary">
                          {h.where}
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => remove(i)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={t.removeHistoryItem(h.label)}
                      className="h-11 w-11 items-center justify-center"
                    >
                      <Icon name="close" size={16} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                ))
              )}
            </View>

            <View className="gap-3">
              <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                {t.popular}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(popularQuery.data ?? []).map((p) => (
                  <Chip key={p.query} onPress={() => setQuery(p.query)}>
                    {p.label}
                  </Chip>
                ))}
              </View>
            </View>

            <View className="gap-2.5">
              <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                {t.recommendedCategories}
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                {(categoriesQuery.data ?? []).slice(0, 4).map((c) => (
                  <View key={c.id} style={{ width: '47%' }}>
                    <CategoryTile
                      category={c}
                      size="search"
                      onPress={() =>
                        router.push({ pathname: '/search/results', params: { categoryId: c.id } })
                      }
                    />
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
