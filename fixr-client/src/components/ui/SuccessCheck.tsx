/**
 * Coche de succès animée — design/RequestSuccess.dc.html (cercle 104px + 2 anneaux pulsés).
 * « Réduire les animations » actif : état final statique, sans boucle (CLAUDE.md), même
 * précaution que Skeleton.tsx.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from '@/lib/animated';
import { useTheme } from '@/theme/useTheme';

import { Icon } from './Icon';

export type SuccessCheckProps = {
  /** Diamètre du cercle plein, défaut 104 (valeur de la maquette). */
  size?: number;
  testID?: string;
};

export function SuccessCheck({ size = 104, testID }: SuccessCheckProps) {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);

  const circleScale = useSharedValue(0.3);
  const checkOpacity = useSharedValue(0);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (cancelled) return;
      setReduceMotion(v);
      if (v) {
        circleScale.value = 1;
        checkOpacity.value = 1;
        return;
      }
      circleScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.5)) });
      checkOpacity.value = withDelay(350, withTiming(1, { duration: 300 }));
      ring1.value = withDelay(500, withRepeat(withTiming(1, { duration: 1800 }), -1, false));
      ring2.value = withDelay(1100, withRepeat(withTiming(1, { duration: 1800 }), -1, false));
    });
    return () => {
      cancelled = true;
      cancelAnimation(ring1);
      cancelAnimation(ring2);
    };
  }, [circleScale, checkOpacity, ring1, ring2]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: circleScale.value }] }));
  const checkStyle = useAnimatedStyle(() => ({ opacity: checkOpacity.value }));
  const ring1Style = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - ring1.value),
    transform: [{ scale: 1 + ring1.value * 0.45 }],
  }));
  const ring2Style = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - ring2.value),
    transform: [{ scale: 1 + ring2.value * 0.45 }],
  }));

  return (
    <View
      testID={testID}
      style={{ width: size * 1.3, height: size * 1.3 }}
      className="items-center justify-center"
    >
      {!reduceMotion ? (
        <>
          <AnimatedView
            pointerEvents="none"
            style={[
              ring1Style,
              { position: 'absolute', width: size, height: size, borderRadius: size / 2 },
            ]}
            className="border-2 border-success"
          />
          <AnimatedView
            pointerEvents="none"
            style={[
              ring2Style,
              { position: 'absolute', width: size, height: size, borderRadius: size / 2 },
            ]}
            className="border-2 border-success"
          />
        </>
      ) : null}
      <AnimatedView
        style={[circleStyle, { width: size, height: size, borderRadius: size / 2 }]}
        className="items-center justify-center bg-success"
      >
        <AnimatedView style={checkStyle}>
          <Icon name="check" size={size * 0.42} color={colors.onSuccess} strokeWidth={2.6} />
        </AnimatedView>
      </AnimatedView>
    </View>
  );
}
