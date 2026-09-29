/**
 * Interrupteur — design/Components.dc.html « Interrupteur » (48×28, bouton 22).
 */
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';
import { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { AnimatedView } from '@/lib/animated';
import { cn } from '@/lib/cn';
import { motion } from '@/theme/tokens';

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
  const progress = useDerivedValue(
    () => withTiming(value ? 1 : 0, { duration: motion.duration.base }),
    [value],
  );

  const trackStyle = useAnimatedStyle(() => ({
    opacity: disabled ? 0.4 : 1,
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
        style={trackStyle}
        className={cn(
          'h-7 w-12 justify-center rounded-full',
          value ? 'bg-primary' : 'bg-border-strong',
        )}
      >
        <AnimatedView
          style={knobStyle}
          className="absolute h-[22px] w-[22px] rounded-full bg-surface"
        />
      </AnimatedView>
    </Pressable>
  );
}
