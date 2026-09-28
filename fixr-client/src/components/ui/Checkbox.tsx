/**
 * Case à cocher — 20 px, cible tactile 44 (hitSlop). Pas de maquette dédiée : style aligné
 * sur Radio (design/Components.dc.html, sheet « Trier par ») et la charte des composants.
 */
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/useTheme';

import { Icon } from './Icon';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

export function Checkbox({ checked, onChange, disabled = false, accessibilityLabel, testID }: CheckboxProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        void Haptics.selectionAsync();
        onChange(!checked);
      }}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled }}
      hitSlop={12}
      className={cn(
        'h-5 w-5 items-center justify-center rounded-[6px] border-2',
        disabled
          ? 'bg-surface-muted border-border-subtle'
          : checked
            ? 'bg-primary border-primary'
            : 'bg-surface border-border-strong',
      )}
    >
      {checked ? <Icon name="check" size={14} color={disabled ? colors.textDisabled : colors.onPrimary} /> : null}
    </Pressable>
  );
}
