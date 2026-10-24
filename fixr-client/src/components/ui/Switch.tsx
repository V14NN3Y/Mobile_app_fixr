/**
 * Interrupteur — design/Components.dc.html « Interrupteur » (48×28, bouton 22).
 */
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';
import { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { AnimatedView } from '@/lib/animated';
import { motion } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

const KNOB_OFFSET_ON = 23;
const KNOB_OFFSET_OFF = 3;

export function Switch({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
  testID,
}: SwitchProps) {
  const { colors } = useTheme();
  const progress = useDerivedValue(
    () => withTiming(value ? 1 : 0, { duration: motion.duration.base }),
    [value],
  );

  // Pas de className sur un élément animé (voir Button.tsx) — couleurs résolues en JS.
  const trackStyle = useAnimatedStyle(() => ({
    opacity: disabled ? 0.4 : 1,
    backgroundColor: value ? colors.primary : colors.borderStrong,
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: KNOB_OFFSET_OFF + progress.value * (KNOB_OFFSET_ON - KNOB_OFFSET_OFF),
      },
    ],
  }));

  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        void Haptics.selectionAsync();
        onValueChange(!value);
      }}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      hitSlop={8}
    >
      <AnimatedView
        style={[trackStyle, { height: 28, width: 48, justifyContent: 'center', borderRadius: 999 }]}
      >
        <AnimatedView
          style={[
            knobStyle,
            {
              position: 'absolute',
              height: 22,
              width: 22,
              borderRadius: 999,
              backgroundColor: colors.surface,
            },
          ]}
        />
      </AnimatedView>
    </Pressable>
  );
}
