/**
 * Puce — design/Components.dc.html « Puces, filtres, onglets ».
 * variant="default" : puce neutre (catégories, suggestions).
 * variant="selected" : sélection inversée (fond text/bg), sans retrait — ex. « Tout ».
 * variant="filter"   : filtre actif (primary-soft), généralement retirable (« Aujourd'hui ✕ »).
 */
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/useTheme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ChipVariant = 'default' | 'selected' | 'filter';

export type ChipProps = {
  children: string;
  variant?: ChipVariant;
  icon?: IconName;
  /** Couleur forcée de l'icône (ex. étoile de notation, toujours jaune). */
  iconColor?: string;
  removable?: boolean;
  onRemove?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
};

const containerClass: Record<ChipVariant, string> = {
  default: 'bg-surface border-border',
  selected: 'bg-text border-text',
  filter: 'bg-primary-soft border-primary',
};

export function Chip({
  children,
  variant = 'default',
  icon,
  iconColor,
  removable = false,
  onRemove,
  onPress,
  disabled = false,
  testID,
}: ChipProps) {
  const { colors } = useTheme();

  const fg = disabled
    ? colors.textDisabled
    : { default: colors.text, selected: colors.bg, filter: colors.primary }[variant];
  const textClass = disabled
    ? 'text-text-disabled'
    : { default: 'text-text', selected: 'text-bg', filter: 'text-primary' }[variant];

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { disabled, selected: variant !== 'default' } : undefined}
      className={cn(
        'h-[38px] flex-row items-center gap-1.5 rounded-full border-[1.5px] px-3.5',
        disabled ? 'border-border-subtle bg-surface-muted' : containerClass[variant],
      )}
    >
      {icon ? <Icon name={icon} size={14} color={iconColor ?? fg} /> : null}
      <Text variant="label" tone="inherit" className={textClass} numberOfLines={1}>
        {children}
      </Text>
      {removable ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Retirer ${children}`}
        >
          <Icon name="close" size={14} color={fg} />
        </Pressable>
      ) : null}
    </Wrapper>
  );
}
