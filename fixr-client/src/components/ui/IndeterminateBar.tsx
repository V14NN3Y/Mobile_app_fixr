/**
 * Barre de progression indéterminée — design/StatesB.dc.html col. 1 (soumission en cours).
 * Balayage 8 %→92 % en boucle 2,4 s. « Réduire les animations » : repli statique à ~50 %,
 * figé (même précaution que Skeleton.tsx) plutôt que masqué, pour garder une présence
 * visuelle cohérente avec `aria-busy`.
 */
import { useEffect } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { AnimatedView } from '@/lib/animated';

export type IndeterminateBarProps = {
  /** Défaut 3 (valeur de la maquette). */
  height?: number;
  testID?: string;
};

export function IndeterminateBar({ height = 3, testID }: IndeterminateBarProps) {
  const progress = useSharedValue(0.08);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (cancelled) return;
      if (v) {
        progress.value = 0.5;
        return;
      }
      progress.value = withRepeat(withTiming(0.92, { duration: 1200 }), -1, true);
    });
    return () => {
      cancelled = true;
    };
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      style={{ height }}
      className="w-full overflow-hidden bg-primary-soft"
    >
      <AnimatedView style={barStyle} className="h-full bg-primary" />
    </View>
  );
}
