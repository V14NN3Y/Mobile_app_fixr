/**
 * Texte — 9 variantes de tokens.typography (design/DesignSystem.dc.html §03).
 * display/title1/title2/title3 = Bricolage Grotesque ; bodyLg/body/label/caption/micro = Manrope.
 * Aucune couleur en dur : `tone` mappe vers les classes text-* du thème.
 */
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/cn';

export type TextVariant =
  'display' | 'title1' | 'title2' | 'title3' | 'bodyLg' | 'body' | 'label' | 'caption' | 'micro';

export type TextTone = 'default' | 'secondary' | 'tertiary' | 'disabled' | 'inherit';

const variantClass: Record<TextVariant, string> = {
  display: 'font-display text-display',
  title1: 'font-display text-title1',
  title2: 'font-display text-title2',
  title3: 'font-display text-title3',
  bodyLg: 'font-body text-body-lg',
  body: 'font-body text-body',
  label: 'font-body-bold text-label',
  caption: 'font-body-semibold text-caption',
  micro: 'font-body-extrabold text-micro uppercase',
};

const toneClass: Record<TextTone, string> = {
  default: 'text-text',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  disabled: 'text-text-disabled',
  inherit: '',
};

export type TextComponentProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
};

export function Text({
  variant = 'body',
  tone = 'default',
  className,
  ...props
}: TextComponentProps) {
  return (
    <RNText
      className={cn(variantClass[variant], toneClass[tone], className)}
      allowFontScaling
      {...props}
    />
  );
}
