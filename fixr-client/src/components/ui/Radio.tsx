/**
 * Bouton radio — 20 px, anneau 6 px quand sélectionné (design/Components.dc.html,
 * sheet « Trier par »). Cible tactile 44 via hitSlop.
 */
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';

export type RadioProps = {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

export function Radio({ selected, onSelect, disabled = false, accessibilityLabel, testID }: RadioProps) {
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={() => {
        if (disabled || selected) return;
        void Haptics.selectionAsync();
        onSelect();
      }}
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: selected, disabled }}
      hitSlop={12}
      className={cn(
        'h-5 w-5 rounded-full bg-surface',
        disabled
          ? 'border-2 border-border-subtle'
          : selected
            ? 'border-[6px] border-primary'
            : 'border-2 border-border-strong',
      )}
    />
  );
}
