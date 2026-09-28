/**
 * Champ de texte — design/Components.dc.html « Champs ».
 * États : défaut, focus (halo primary 4 px), erreur (bordure + fond + message), désactivé.
 * Le halo de focus n'a pas d'équivalent box-shadow en React Native : rendu par une vue
 * absolue semi-transparente autour du champ (voir Point signalé n°3 du plan).
 */
import { forwardRef, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/lib/cn';
import { withAlpha } from '@/lib/color';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: IconName;
  disabled?: boolean;
  containerClassName?: string;
  testID?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    hint,
    error,
    icon,
    disabled = false,
    containerClassName,
    testID,
    onFocus,
    onBlur,
    ...inputProps
  },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const inputId = testID ?? label;

  const iconColor = disabled ? colors.textDisabled : colors.textTertiary;
  const placeholderColor = disabled ? colors.textDisabled : colors.textTertiary;

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <Text variant="label" nativeID={inputId ? `${inputId}-label` : undefined}>
          {label}
        </Text>
      ) : null}

      <View className="relative">
        {focused && !disabled ? (
          <View
            pointerEvents="none"
            className="absolute -inset-1"
            style={{
              borderRadius: radius.lg + 4,
              backgroundColor: withAlpha(colors.primary, 0.12),
            }}
          />
        ) : null}

        <View
          className={cn(
            'h-input flex-row items-center gap-2.5 rounded-lg border-[1.5px] px-3.5',
            disabled
              ? 'border-surface-muted bg-surface-muted'
              : hasError
                ? 'border-danger-border bg-field-error-bg'
                : focused
                  ? 'border-primary bg-surface'
                  : 'border-border-strong bg-surface',
          )}
        >
          {icon ? <Icon name={icon} size={20} color={iconColor} /> : null}
          <TextInput
            ref={ref}
            testID={testID}
            editable={!disabled}
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            placeholderTextColor={placeholderColor}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              'flex-1 p-0 font-body-semibold text-body',
              disabled ? 'text-text-disabled' : 'text-text',
            )}
            {...inputProps}
          />
        </View>
      </View>

      {hasError ? (
        <Text variant="caption" className="text-danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="secondary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});
