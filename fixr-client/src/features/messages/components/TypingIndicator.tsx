/**
 * Indicateur de frappe (Chat) — 3 points rebondissants décalés (design/Chat.dc.html).
 * Respecte « Réduire les animations » : points figés, pas de boucle (même discipline que
 * MissionTimeline.CurrentDot, Lot 5).
 */
import { useEffect } from 'react';
import { View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { AnimatedView } from '@/lib/animated';
import { fr } from '@/lib/i18n/fr';
import { useReduceMotion } from '@/lib/motion';
import { useTheme } from '@/theme/useTheme';

function Dot({ delay, reduceMotion }: { delay: number; reduceMotion: boolean }) {
  const { colors } = useTheme();
  const bounce = useSharedValue(0);

  useEffect(() => {
    if (!reduceMotion) bounce.value = withDelay(delay, withRepeat(withTiming(1, { duration: 500 }), -1, true));
  }, [reduceMotion, delay, bounce]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: reduceMotion ? 0 : -3 * bounce.value }],
    opacity: reduceMotion ? 0.6 : 0.5 + 0.5 * bounce.value,
  }));

  // Pas de className sur un élément animé (voir Button.tsx).
  return (
    <AnimatedView
      style={[style, { height: 6, width: 6, borderRadius: 999, backgroundColor: colors.textTertiary }]}
    />
  );
}

export type TypingIndicatorProps = { artisanFirstName: string };

export function TypingIndicator({ artisanFirstName }: TypingIndicatorProps) {
  const reduceMotion = useReduceMotion();

  return (
    <View
      accessibilityLabel={fr.messages.chat.typingLabel(artisanFirstName)}
      className="flex-row items-center gap-1 self-start rounded-2xl rounded-bl-md border border-border-subtle bg-surface px-4 py-3.5"
    >
      <Dot delay={0} reduceMotion={reduceMotion} />
      <Dot delay={150} reduceMotion={reduceMotion} />
      <Dot delay={300} reduceMotion={reduceMotion} />
    </View>
  );
}
