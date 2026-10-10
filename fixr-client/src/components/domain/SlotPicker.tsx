/**
 * Grille de créneaux — design/RequestDate.dc.html. Le libellé de chaque créneau est fourni
 * par l'appelant (texte centralisé dans fr.ts) : ce composant reste un rendu pur.
 */
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export type SlotPickerItem = {
  start: string;
  end: string;
  label: string;
  statusLabel: string;
  disabled: boolean;
  /** Dernier artisan dispo — encre d'avertissement plutôt que la réussite habituelle. */
  warning?: boolean;
};

export type SlotPickerProps = {
  slots: SlotPickerItem[];
  selectedIndex?: number;
  onSelect: (index: number) => void;
  testID?: string;
};

export function SlotPicker({ slots, selectedIndex, onSelect, testID }: SlotPickerProps) {
  return (
    <View testID={testID} className="flex-row flex-wrap gap-2">
      {slots.map((slot, i) => {
        const selected = i === selectedIndex;
        return (
          <Pressable
            key={`${slot.start}-${slot.end}`}
            disabled={slot.disabled}
            onPress={() => !slot.disabled && onSelect(i)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: slot.disabled }}
            accessibilityLabel={`${slot.label}, ${slot.statusLabel}`}
            style={{ width: '48%' }}
            className={cn(
              'h-16 items-center justify-center gap-0.5 rounded-lg border',
              slot.disabled
                ? 'border-border-subtle bg-surface-muted'
                : selected
                  ? 'border-primary bg-primary-soft'
                  : 'border-border bg-surface',
            )}
          >
            <Text variant="label" className="font-body-bold" tone={slot.disabled ? 'disabled' : 'default'}>
              {slot.label}
            </Text>
            <Text
              variant="caption"
              tone={slot.disabled ? 'disabled' : undefined}
              className={!slot.disabled ? (slot.warning ? 'text-accent-ink' : 'text-success-ink') : undefined}
            >
              {slot.statusLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
