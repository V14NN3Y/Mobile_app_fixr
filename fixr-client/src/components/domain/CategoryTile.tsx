/**
 * Tuile de catégorie — design/Home.dc.html « Services » (size="home") et
 * design/Search.dc.html « Catégories recommandées » (size="search", avec compteur).
 */
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { Category } from '@/types/domain';

export type CategoryTileProps = {
  category: Pick<Category, 'id' | 'label' | 'artisanCount'>;
  size: 'home' | 'search';
  onPress: () => void;
  testID?: string;
};

export function CategoryTile({ category, size, onPress, testID }: CategoryTileProps) {
  const { categoryTints } = useTheme();
  const tint = categoryTints[category.id];

  if (size === 'search') {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${category.label}, ${category.artisanCount} pros`}
        className="h-[88px] justify-between rounded-xl p-3.5 active:opacity-90"
        style={{ backgroundColor: tint.bg }}
      >
        <Icon name={category.id} size={24} color={tint.ink} />
        <View className="flex-row items-baseline justify-between">
          <Text
            variant="label"
            tone="inherit"
            style={{ color: tint.ink }}
            className="font-body-extrabold"
            numberOfLines={1}
          >
            {category.label}
          </Text>
          <Text variant="caption" tone="inherit" style={{ color: tint.ink }} numberOfLines={1}>
            {fr.search.prosCount(category.artisanCount)}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={category.label}
      className="items-center gap-2 rounded-2xl border border-border-subtle bg-surface py-3 active:scale-95"
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-md"
        style={{ backgroundColor: tint.bg }}
      >
        <Icon name={category.id} size={22} color={tint.ink} />
      </View>
      <Text
        variant="micro"
        className="normal-case tracking-normal text-center"
        numberOfLines={1}
      >
        {category.label}
      </Text>
    </Pressable>
  );
}
