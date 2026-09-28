/**
 * Indicateur de chargement rond — utilisé par Button. 18 px, trait 2.5, piste à 35 %,
 * rotation continue 0.7 s (design/Components.dc.html .spin).
 * Respecte « Réduire les animations » : rotation remplacée par un pictogramme statique.
 */
import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export type SpinnerProps = {
  size?: number;
  color?: string;
  trackColor?: string;
};

export function Spinner({ size = 18, color = '#FFFFFF', trackColor = 'rgba(255,255,255,0.35)' }: SpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        rotation.value = 0;
      } else {
        rotation.value = withRepeat(withTiming(360, { duration: 700, easing: Easing.linear }), -1, false);
      }
    });
    return () => {
      cancelled = true;
      cancelAnimation(rotation);
    };
  }, [rotation]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2.5,
          borderColor: trackColor,
          borderTopColor: color,
        },
      ]}
    />
  );
}
