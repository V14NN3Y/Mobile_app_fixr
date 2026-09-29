/**
 * Onglets soulignés — design/Components.dc.html (À venir / En cours / Terminées / Annulées).
 * Bordure basse globale + repère 3 px animé sous l'onglet actif.
 */
import { useEffect, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedView } from '@/lib/animated';

import { motion } from '@/theme/tokens';

import { Text } from './Text';

export type TabsOption<T extends string> = { value: T; label: string };

export type TabsProps<T extends string> = {
  options: TabsOption<T>[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
};

export function Tabs<T extends string>({ options, value, onChange, testID }: TabsProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const tabWidth = options.length > 0 ? width / options.length : 0;
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withTiming(index * tabWidth, { duration: motion.duration.base });
  }, [index, tabWidth, offset]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <View
      testID={testID}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessibilityRole="tablist"
      className="relative flex-row border-b border-border"
    >
      {tabWidth > 0 ? (
        <AnimatedView
          pointerEvents="none"
          style={[
            indicatorStyle,
            { position: 'absolute', bottom: -1, left: 0, width: tabWidth, height: 3 },
          ]}
          className="rounded-t-[3px] bg-primary"
        />
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className="flex-1 items-center py-3"
          >
            <Text
              variant="caption"
              tone={selected ? 'default' : 'tertiary'}
              className="font-body-bold"
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
