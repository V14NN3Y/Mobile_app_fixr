/**
 * Barre de progression — design/Components.dc.html « Progression » (bandeau « Continue »).
 */
import { View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedView } from '@/lib/animated';
import { useEffect } from 'react';

import { cn } from '@/lib/cn';
import { motion } from '@/theme/tokens';

export type ProgressBarProps = {
  /** 0–100. */
  value: number;
  height?: 4 | 6 | 8;
  tone?: 'primary' | 'accent';
  testID?: string;
};

const toneClass = { primary: 'bg-primary', accent: 'bg-accent' } as const;

export function ProgressBar({ value, height = 8, tone = 'primary', testID }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(clamped, { duration: motion.duration.base });
  }, [clamped, width]);

  const style = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={{ height, borderRadius: height / 2 }}
      className="overflow-hidden bg-border-subtle"
    >
      <AnimatedView style={style} className={cn('h-full rounded-full', toneClass[tone])} />
    </View>
  );
}
