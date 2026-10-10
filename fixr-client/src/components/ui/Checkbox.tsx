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
  /** design/SignupErrors.dc.html : case CGU non cochée après soumission — bordure/fond erreur. */
  error?: boolean;
  /** 'default' (primary coché) | 'danger' (rouge coché) — Lot 7, case d'acquiescement de
   * suppression de compte (design/Settings.dc.html, `.chk-on` en #B02E28). */
  tone?: 'default' | 'danger';
  accessibilityLabel?: string;
  testID?: string;
};

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  error = false,
  tone = 'default',
  accessibilityLabel,
  testID,
}: CheckboxProps) {
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
          ? 'border-border-subtle bg-surface-muted'
          : checked
            ? tone === 'danger'
              ? 'border-danger bg-danger'
              : 'border-primary bg-primary'
            : error
              ? 'border-danger-border bg-field-error-bg'
              : 'border-border-strong bg-surface',
      )}
    >
      {checked ? (
        <Icon
          name="check"
          size={14}
          color={disabled ? colors.textDisabled : tone === 'danger' ? colors.onDanger : colors.onPrimary}
        />
      ) : null}
    </Pressable>
  );
}
