/**
 * Primitives d'animation réutilisées par les illustrations du Lot 2 — équivalents RN des
 * classes CSS des maquettes (.float, .pulse, .dash, .pop, .fu, .slide). Toutes respectent
 * « Réduire les animations » (useReduceMotion) : repli en fondu simple, jamais de boucle.
 */
import { useEffect, type ReactNode } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Path, type PathProps } from 'react-native-svg';

import { AnimatedView } from '@/lib/animated';
import { useReduceMotion } from '@/lib/motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** .float — flottement vertical en boucle, 5 s. */
export function FloatingCard({ children, style }: { children: ReactNode; style?: object }) {
  const reduceMotion = useReduceMotion();
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      translateY.value = 0;
      return;
    }
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(translateY);
  }, [reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return <AnimatedView style={[style, animatedStyle]}>{children}</AnimatedView>;
}

/** .pulse — anneau expansif en boucle, 1.6 s. `color` résolu (voir Icon.tsx). */
export function PulsingDot({
  size = 10,
  color,
  ringColor,
}: {
  size?: number;
  color: string;
  ringColor: string;
}) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    if (reduceMotion) return;
    scale.value = withRepeat(
      withTiming(2.4, { duration: 1600, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1600, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [reduceMotion, scale, opacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: reduceMotion ? 0 : opacity.value,
  }));

  return (
    // Pas de className sur un élément animé (voir Button.tsx) — centrage en style, inutile ici
    // de toute façon puisque anneau et point font déjà exactement la taille du conteneur.
    <AnimatedView
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      {!reduceMotion ? (
        <AnimatedView
          style={[
            {
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: ringColor,
            },
            ringStyle,
          ]}
        />
      ) : null}
      <AnimatedView
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }}
      />
    </AnimatedView>
  );
}

/** .dash — trajet en tirets, flux animé en boucle (strokeDashoffset), 1.2 s linéaire. */
export function DashedRoute({
  d,
  color,
  strokeWidth = 3.5,
  dashArray = '2 9',
}: {
  d: string;
  color: string;
  strokeWidth?: number;
  dashArray?: string;
}) {
  const reduceMotion = useReduceMotion();
  const offset = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    offset.value = withRepeat(
      withTiming(-40, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(offset);
  }, [reduceMotion, offset]);

  const animatedProps = useAnimatedProps<PathProps>(() => ({ strokeDashoffset: offset.value }));

  return (
    <AnimatedPath
      d={d}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
      strokeDasharray={dashArray}
      animatedProps={animatedProps}
    />
  );
}

/** .pop — apparition avec rebond, un coup (badges, chiffres OTP, CTA final). */
export function PopIn({
  children,
  delayMs = 0,
  style,
}: {
  children: ReactNode;
  delayMs?: number;
  style?: object;
}) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delayMs,
      withTiming(1, {
        duration: reduceMotion ? 200 : 500,
        easing: reduceMotion ? Easing.linear : Easing.out(Easing.back(1.4)),
      }),
    );
  }, [reduceMotion, delayMs, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: reduceMotion ? 1 : 0.6 + progress.value * 0.4 }],
  }));

  return <AnimatedView style={[style, animatedStyle]}>{children}</AnimatedView>;
}

/** .fu — fondu + translation depuis le bas, un coup (cartes flottantes des illustrations). */
export function FadeUp({
  children,
  delayMs = 0,
  style,
}: {
  children: ReactNode;
  delayMs?: number;
  style?: object;
}) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delayMs,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
  }, [delayMs, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: reduceMotion ? 0 : (1 - progress.value) * 12 }],
  }));

  return <AnimatedView style={[style, animatedStyle]}>{children}</AnimatedView>;
}

/** .slide — fondu + translation horizontale, un coup par page active (pager d'onboarding). */
export function SlideIn({
  children,
  active,
  style,
}: {
  children: ReactNode;
  active: boolean;
  style?: object;
}) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    if (active) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
    }
  }, [active, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: reduceMotion ? 0 : (1 - progress.value) * 24 }],
  }));

  return <AnimatedView style={[style, animatedStyle]}>{children}</AnimatedView>;
}
