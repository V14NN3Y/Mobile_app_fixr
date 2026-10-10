/**
 * Bandeau de jours — design/RequestDate.dc.html. Statut par jour dérivé de données réelles
 * (voir features/request/availability.ts), pas copié de la maquette.
 */
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export type DateStripAvailability = 'ok' | 'low' | 'full';

export type DateStripDay = {
  dayOffset: number;
  dow: string;
  num: string;
  availability: DateStripAvailability;
};

export type DateStripProps = {
  days: DateStripDay[];
  selectedOffset?: number;
  onSelect: (dayOffset: number) => void;
  testID?: string;
};

const dotClass: Record<DateStripAvailability, string> = {
  ok: 'bg-online',
  low: 'bg-accent',
  full: 'bg-transparent',
};

export function DateStrip({ days, selectedOffset, onSelect, testID }: DateStripProps) {
  return (
    <ScrollView
      testID={testID}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {days.map((d) => {
        const selected = d.dayOffset === selectedOffset;
        const disabled = d.availability === 'full';
        return (
          <Pressable
            key={d.dayOffset}
            disabled={disabled}
            onPress={() => !disabled && onSelect(d.dayOffset)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            accessibilityLabel={`${d.dow} ${d.num}`}
            className={cn(
              'h-[76px] w-[58px] items-center justify-center gap-1 rounded-xl border',
              disabled
                ? 'border-border-subtle bg-surface-muted'
                : selected
                  ? 'border-primary bg-primary'
                  : 'border-border bg-surface',
            )}
          >
            <Text
              variant="caption"
              tone={disabled ? 'disabled' : selected ? 'inherit' : 'secondary'}
              className={selected && !disabled ? 'text-on-primary' : undefined}
            >
              {d.dow}
            </Text>
            <Text
              variant="title3"
              className={cn('font-display', selected && !disabled && 'text-on-primary')}
              tone={disabled ? 'disabled' : selected ? 'inherit' : 'default'}
            >
              {d.num}
            </Text>
            <View className={cn('h-1.5 w-1.5 rounded-full', dotClass[d.availability])} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
