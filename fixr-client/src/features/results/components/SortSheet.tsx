/**
 * Tri en bottom sheet — design/Results.dc.html « Trier par ».
 */
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { forwardRef } from 'react';
import { Pressable, View } from 'react-native';

import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import type { ArtisanSort } from '@/features/artisans/types';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

const SORTS: ArtisanSort[] = ['relevance', 'rating', 'distance', 'priceAsc'];

export type SortSheetProps = {
  value: ArtisanSort;
  onChange: (sort: ArtisanSort) => void;
};

export const SortSheet = forwardRef<BottomSheetModal, SortSheetProps>(function SortSheet(
  { value, onChange },
  ref,
) {
  const { colors } = useTheme();
  const t = fr.results;

  return (
    <Sheet ref={ref} testID="sort-sheet">
      <Text variant="title2" className="font-display">
        {t.sortTitle}
      </Text>
      <View>
        {SORTS.map((s) => {
          const selected = s === value;
          return (
            <Pressable
              key={s}
              onPress={() => {
                onChange(s);
                if (typeof ref === 'object' && ref?.current) ref.current.dismiss();
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              className="min-h-[52px] flex-row items-center justify-between border-b border-border-subtle"
            >
              <Text variant="bodyLg" className="font-body-bold">
                {t.sortOptions[s]}
              </Text>
              <View
                className="h-[22px] w-[22px] items-center justify-center rounded-full border-2"
                style={{ borderColor: selected ? colors.primary : colors.borderStrong }}
              >
                {selected ? (
                  <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
});
