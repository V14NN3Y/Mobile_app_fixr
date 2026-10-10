/**
 * Résultats — vue liste (design/Results.dc.html). Tri en bottom sheet, puces de filtres
 * actives retirables, FlashList avec skeleton de pagination en pied de liste.
 */
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArtisanCard } from '@/components/domain';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useArtisans } from '@/features/artisans/hooks';
import { useFiltersStore } from '@/features/filters/store';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { Artisan, Category } from '@/types/domain';

import { buildActiveFilterChips } from '../activeFilters';
import { ActiveFilterChips } from './ActiveFilterChips';
import { SortSheet } from './SortSheet';

export type ResultsListScreenProps = {
  category: Category | undefined;
};

function ResultsFooterSkeleton({ current, total }: { current: number; total: number }) {
  const t = fr.results;
  return (
    <View className="gap-3 px-4 pb-4">
      <View className="gap-3 rounded-xl border border-border-subtle bg-surface p-3.5">
        <View className="flex-row gap-3">
          <Skeleton width={60} height={60} rounded={999} />
          <View className="flex-1 justify-center gap-2 pt-1">
            <Skeleton height={14} width="70%" />
            <Skeleton height={12} width="50%" />
            <Skeleton height={12} width="60%" />
          </View>
        </View>
        <View className="flex-row gap-1.5">
          <Skeleton width={90} height={22} rounded={999} />
          <Skeleton width={80} height={22} rounded={999} />
        </View>
      </View>
      <Text variant="caption" tone="secondary" className="text-center">
        {t.loadingMore(current, total)}
      </Text>
    </View>
  );
}

export function ResultsListScreen({ category }: ResultsListScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.results;
  const sheetRef = useRef<BottomSheetModal>(null);

  const { applied, sort, setSort, removeAppliedFilter } = useFiltersStore();
  const query = useArtisans(applied, sort);

  const items: Artisan[] = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  const renderItem = useCallback(
    ({ item }: { item: Artisan }) => (
      <View className="px-4 pb-3">
        <ArtisanCard
          artisan={item}
          variant="rich"
          onPress={() => router.push(`/artisan/${item.id}`)}
          onRequestPress={() => router.push({ pathname: '/request/need', params: { artisanId: item.id } })}
        />
      </View>
    ),
    [],
  );

  return (
    <View className="flex-1 bg-bg">
      <View
        className="gap-3 border-b border-border-subtle bg-bg pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center gap-2.5 px-4">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={fr.auth.common.back}
            className="h-11 w-11 items-center justify-center"
          >
            <Icon name="chevronLeft" size={22} color={colors.text} />
          </Pressable>
          <View className="flex-1">
            <Text variant="title3" className="font-display" numberOfLines={1}>
              {category?.label ?? fr.results.displayMode.list}
            </Text>
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {t.artisanCount(total)}
            </Text>
          </View>
          <Segmented
            options={[
              { value: 'list', label: t.displayMode.list },
              { value: 'map', label: t.displayMode.map },
            ]}
            value="list"
            onChange={(v) => {
              if (v === 'map') {
                router.setParams({ view: 'map' });
              }
            }}
          />
        </View>
        <View className="flex-row gap-2 px-4">
          <Chip variant="selected" onPress={() => router.push('/filters')}>
            {t.filtersChip(buildActiveFilterChips(applied).length)}
          </Chip>
          <Chip onPress={() => sheetRef.current?.present()} icon="chevronDown">
            {t.sortLabel(t.sortOptions[sort])}
          </Chip>
        </View>
        <ActiveFilterChips filters={applied} onRemove={removeAppliedFilter} />
      </View>

      {query.isLoading ? (
        <View className="gap-3 p-4">
          {[0, 1, 2].map((i) => (
            <View key={i} className="gap-3 rounded-xl border border-border-subtle bg-surface p-3.5">
              <View className="flex-row gap-3">
                <Skeleton width={60} height={60} rounded={999} />
                <View className="flex-1 justify-center gap-2 pt-1">
                  <Skeleton height={14} width="70%" />
                  <Skeleton height={12} width="50%" />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : query.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <Banner tone="error">{fr.auth.common.networkError}</Banner>
          <Button variant="primary" onPress={() => query.refetch()}>
            {fr.auth.common.retry}
          </Button>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <EmptyState
            icon="search"
            title={t.empty.title}
            description={t.empty.description}
            action={{ label: t.empty.action, onPress: () => router.push('/filters') }}
          />
        </View>
      ) : (
        <FlashList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 12 }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <ResultsFooterSkeleton current={items.length} total={total} />
            ) : null
          }
        />
      )}

      <SortSheet ref={sheetRef} value={sort} onChange={setSort} />
    </View>
  );
}
