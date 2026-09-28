/**
 * Sélecteur segmenté — design/Components.dc.html (Liste / Carte).
 * Piste border-subtle, pastille active `surface` + ombre e1, translation animée.
 */
import { useEffect, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { elevation, motion } from '@/theme/tokens';

import { Text } from './Text';

export type SegmentedOption<T extends string> = { value: T; label: string };

export type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const offset = useSharedValue(0);

  const segmentWidth = options.length > 0 ? width / options.length : 0;

  useEffect(() => {
    offset.value = withTiming(index * segmentWidth, { duration: motion.duration.base });
  }, [index, segmentWidth, offset]);

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      testID={testID}
      onLayout={handleLayout}
      accessibilityRole="tablist"
      className="flex-row gap-1 rounded-lg bg-border-subtle p-1"
    >
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            pillStyle,
            elevation.e1,
            { position: 'absolute', top: 4, bottom: 4, left: 4, width: segmentWidth - 4 },
          ]}
          className="rounded-[10px] bg-surface"
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
            className="h-[38px] flex-1 items-center justify-center rounded-[10px]"
          >
            <Text variant="label" tone={selected ? 'default' : 'secondary'} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
