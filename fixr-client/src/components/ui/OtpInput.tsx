/**
 * Code à 6 chiffres — design/Otp.dc.html. Un seul vrai TextInput (invisible, superposé),
 * 6 View purement décoratives : c'est la cible unique que l'OS remplit pour l'autofill SMS
 * (textContentType="oneTimeCode" / autoComplete="sms-otp") et pour un collage d'un coup —
 * pas 6 champs chaînés avec focus() manuel (source classique de bugs de synchronisation).
 */
import { forwardRef, useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from '@/lib/animated';
import { cn } from '@/lib/cn';
import { useReduceMotion } from '@/lib/motion';
import { radius } from '@/theme/tokens';

import { Text } from './Text';

export type OtpInputStatus = 'default' | 'error' | 'success';

export type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  status?: OtpInputStatus;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

export const OtpInput = forwardRef<TextInput, OtpInputProps>(function OtpInput(
  {
    length = 6,
    value,
    onChange,
    onComplete,
    status = 'default',
    disabled = false,
    accessibilityLabel,
    testID,
  },
  ref,
) {
  const localRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const reduceMotion = useReduceMotion();
  const caretOpacity = useSharedValue(1);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      caretOpacity.value = 1;
      return;
    }
    caretOpacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
  }, [reduceMotion, caretOpacity]);

  useEffect(() => {
    if (status !== 'error' || reduceMotion) return;
    shakeX.value = withSequence(
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, reduceMotion]);

  const caretStyle = useAnimatedStyle(() => ({ opacity: caretOpacity.value }));
  const groupStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  const activeIndex = value.length < length ? value.length : -1;

  return (
    <View>
      <AnimatedView style={groupStyle}>
        <Pressable
          onPress={() => localRef.current?.focus()}
          accessibilityRole="none"
          className="flex-row gap-2"
        >
          <View
            className="flex-1 flex-row gap-2"
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
          >
            {Array.from({ length }).map((_, i) => {
              const digit = value[i];
              const isActive = i === activeIndex && focused && status === 'default';
              return (
                <View
                  key={i}
                  testID={testID ? `${testID}-box-${i}` : undefined}
                  className={cn(
                    'h-[58px] flex-1 items-center justify-center rounded-lg border-[1.5px]',
                    status === 'error'
                      ? 'border-danger-border bg-field-error-bg'
                      : status === 'success'
                        ? 'border-success bg-success-soft'
                        : isActive
                          ? 'border-primary bg-surface'
                          : 'border-border-strong bg-surface',
                  )}
                >
                  {digit ? (
                    <Text variant="title2" className="font-display">
                      {digit}
                    </Text>
                  ) : isActive ? (
                    <AnimatedView
                      style={caretStyle}
                      className="h-[26px] w-0.5 rounded-full bg-primary"
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        </Pressable>
      </AnimatedView>

      <TextInput
        ref={(node) => {
          localRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        testID={testID}
        value={value}
        onChangeText={(text) => {
          const digitsOnly = text.replace(/\D/g, '').slice(0, length);
          onChange(digitsOnly);
          if (digitsOnly.length === length) onComplete?.(digitsOnly);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        keyboardType="number-pad"
        maxLength={length}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        caretHidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
          borderRadius: radius.lg,
        }}
      />
    </View>
  );
});
