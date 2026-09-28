/**
 * Squelette de chargement — dégradé animé 1.2 s linéaire (design/Components.dc.html .sk).
 * « Réduire les animations » actif : pas de boucle, fond statique (CLAUDE.md).
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, View, type DimensionValue, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/useTheme';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  /** Rayon en px (défaut 8, comme la maquette). */
  rounded?: number;
  testID?: string;
};

export function Skeleton({ width = '100%', height = 16, rounded = 8, testID }: SkeletonProps) {
  const { colors } = useTheme();
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const translate = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (!cancelled) setReduceMotion(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || layoutWidth === 0) return;
    const span = layoutWidth * 1.6;
    translate.value = -span;
    translate.value = withRepeat(
      withTiming(span, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(translate);
  }, [reduceMotion, layoutWidth, translate]);

  const gradientStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translate.value }] }));

  return (
    <View
      testID={testID}
      onLayout={(e: LayoutChangeEvent) => setLayoutWidth(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width,
        height,
        borderRadius: rounded,
        overflow: 'hidden',
        backgroundColor: colors.skeletonBase,
      }}
    >
      {!reduceMotion && layoutWidth > 0 ? (
        <AnimatedGradient
          colors={[colors.skeletonBase, colors.skeletonHighlight, colors.skeletonBase]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            gradientStyle,
            { position: 'absolute', top: 0, bottom: 0, width: layoutWidth * 0.6 },
          ]}
        />
      ) : null}
    </View>
  );
}
