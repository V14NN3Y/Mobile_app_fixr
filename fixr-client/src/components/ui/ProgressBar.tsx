/**
 * Barre de progression — design/Components.dc.html « Progression » (bandeau « Continue »).
 */
import { View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedView } from '@/lib/animated';
import { useEffect } from 'react';

import { motion } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export type ProgressBarProps = {
  /** 0–100. */
  value: number;
  height?: 4 | 6 | 8;
  tone?: 'primary' | 'accent' | 'rating';
  testID?: string;
};

export function ProgressBar({ value, height = 8, tone = 'primary', testID }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, value));
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(clamped, { duration: motion.duration.base });
  }, [clamped, width]);

  // Pas de className sur un élément animé (voir Button.tsx) — Reanimated écraserait le style
  // NativeWind sur natif ; couleur résolue en JS comme le reste du thème (useTheme.ts).
  const toneColor = { primary: colors.primary, accent: colors.accent, rating: colors.rating }[tone];
  const style = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    height: '100%',
    borderRadius: 999,
    backgroundColor: toneColor,
  }));

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={{ height, borderRadius: height / 2 }}
      className="overflow-hidden bg-border-subtle"
    >
      <AnimatedView style={style} />
    </View>
  );
}
