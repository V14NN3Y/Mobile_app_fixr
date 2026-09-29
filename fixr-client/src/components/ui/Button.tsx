/**
 * Bouton — 4 variantes × 3 tailles (design/Components.dc.html « Boutons »).
 * Couleurs pressées via les variants NativeWind `active:` ; échelle 0.98 (tokens.motion)
 * pilotée par Reanimated pour un retour tactile fluide indépendant du CSS interop.
 * Icône et spinner reçoivent une couleur résolue explicite (pas de currentColor — voir Icon.tsx).
 * Icône seule : carré de la même hauteur, `accessibilityLabel` obligatoire (le type l'impose).
 */
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { AccessibilityInfo } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedPressable } from '@/lib/animated';
import { withAlpha } from '@/lib/color';
import { cn } from '@/lib/cn';
import { motion } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Icon, type IconName } from './Icon';
import { Spinner } from './Spinner';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'lg' | 'md' | 'sm';

const sizeClass: Record<ButtonSize, string> = {
  lg: 'h-button rounded-lg px-[18px] gap-2',
  md: 'h-button-md rounded-md px-[18px] gap-2',
  sm: 'h-button-sm rounded-md px-3.5 gap-1.5',
};

const squareSizeClass: Record<ButtonSize, string> = {
  lg: 'h-button w-button rounded-lg',
  md: 'h-button-md w-button-md rounded-md',
  sm: 'h-button-sm w-button-sm rounded-md',
};

const iconSize: Record<ButtonSize, number> = { lg: 22, md: 20, sm: 18 };

/**
 * tokens.typography.button (16/20, bodyBold) n'est pas l'une des 9 variantes éditoriales de
 * <Text> : on part de la variante `label` (déjà bodyBold) et on ajuste la taille pour lg.
 */
const labelSizeStyle: Record<ButtonSize, { fontSize: number; lineHeight: number } | undefined> = {
  lg: { fontSize: 16, lineHeight: 20 },
  md: undefined,
  sm: undefined,
};

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-pressed',
  secondary: 'bg-surface border-[1.5px] border-border-strong active:border-text active:bg-bg',
  tertiary: 'bg-transparent active:bg-primary-soft',
  destructive: 'bg-danger active:bg-danger-pressed',
};

const disabledVariantClass: Record<ButtonVariant, string> = {
  primary: 'bg-disabled-bg',
  secondary: 'bg-surface border-[1.5px] border-border-subtle',
  tertiary: 'bg-transparent',
  destructive: 'bg-danger-soft',
};

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onPress?: (e: GestureResponderEvent) => void;
  className?: string;
  testID?: string;
};

type LabelProps = BaseProps & {
  children: string;
  icon?: IconName;
  iconOnly?: false;
  accessibilityLabel?: string;
};

type IconOnlyProps = BaseProps & {
  children?: undefined;
  icon: IconName;
  iconOnly: true;
  accessibilityLabel: string;
};

export type ButtonProps = LabelProps | IconOnlyProps;

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'lg',
    loading = false,
    disabled = false,
    onPress,
    className,
    testID,
    icon,
    iconOnly,
    children,
    accessibilityLabel,
  } = props;

  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    scale.value = withTiming(motion.pressScale, { duration: motion.duration.press });
  }, [isDisabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: motion.duration.press });
  }, [scale]);

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (isDisabled) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(e);
    },
    [isDisabled, onPress],
  );

  // Couleur de texte/icône/spinner résolue explicitement (jamais de currentColor en RN).
  const fgColor = isDisabled
    ? colors.textDisabled
    : {
        primary: colors.onPrimary,
        secondary: colors.text,
        tertiary: colors.primary,
        destructive: colors.onDanger,
      }[variant];

  const spinnerTrack = withAlpha(
    fgColor,
    variant === 'secondary' || variant === 'tertiary' ? 0.15 : 0.35,
  );

  const label = iconOnly ? undefined : children;
  const textStyle = [{ color: fgColor }, labelSizeStyle[size]];

  const content = loading ? (
    <>
      <Spinner size={size === 'sm' ? 16 : 18} color={fgColor} trackColor={spinnerTrack} />
      {!iconOnly && label ? (
        <Text variant="label" tone="inherit" style={textStyle} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </>
  ) : iconOnly ? (
    <Icon name={icon} size={iconSize[size]} color={fgColor} />
  ) : (
    <>
      {icon ? <Icon name={icon} size={iconSize[size]} color={fgColor} /> : null}
      <Text variant="label" tone="inherit" style={textStyle} numberOfLines={1}>
        {label}
      </Text>
    </>
  );

  return (
    <AnimatedPressable
      testID={testID}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (typeof label === 'string' ? label : undefined)}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      hitSlop={iconOnly ? undefined : 4}
      style={animatedStyle}
      className={cn(
        'flex-row items-center justify-center',
        iconOnly ? squareSizeClass[size] : sizeClass[size],
        isDisabled ? disabledVariantClass[variant] : variantClass[variant],
        className,
      )}
    >
      {content}
    </AnimatedPressable>
  );
}

/** Annonce un changement d'état de bouton (chargement → succès/erreur) au lecteur d'écran. */
export function announceButtonState(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}
