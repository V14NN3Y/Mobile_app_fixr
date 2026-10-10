/**
 * Bandeau de disponibilité — design/ArtisanProfile.dc.html « Disponibilité » (5 jours).
 */
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';
import { fr } from '@/lib/i18n/fr';

export type AvailabilityDayStatus = 'past' | 'today' | 'available' | 'full';

export type AvailabilityDay = {
  date: string;
  shortLabel: string;
  dayNumber: string;
  status: AvailabilityDayStatus;
};

export type AvailabilityStripProps = {
  days: AvailabilityDay[];
  nextSlotLabel?: string;
  testID?: string;
};

const cellClass: Record<AvailabilityDayStatus, string> = {
  today: 'bg-primary',
  available: 'bg-primary-soft',
  full: 'bg-surface-muted',
  past: 'bg-surface-muted',
};

const textClass: Record<AvailabilityDayStatus, string> = {
  today: 'text-on-primary',
  available: 'text-primary',
  full: 'text-text-tertiary',
  past: 'text-text-disabled',
};

export function AvailabilityStrip({ days, nextSlotLabel, testID }: AvailabilityStripProps) {
  return (
    <View testID={testID} className="gap-3">
      <View className="flex-row gap-1.5">
        {days.map((d) => (
          <View
            key={d.date}
            className={cn(
              'h-[58px] flex-1 items-center justify-center gap-0.5 rounded-md',
              cellClass[d.status],
            )}
          >
            <Text variant="caption" tone="inherit" className={textClass[d.status]} numberOfLines={1}>
              {d.shortLabel}
            </Text>
            <Text
              variant="label"
              tone="inherit"
              className={textClass[d.status]}
              style={{ fontSize: 16 }}
              numberOfLines={1}
            >
              {d.dayNumber}
            </Text>
          </View>
        ))}
      </View>
      {nextSlotLabel ? (
        <Text variant="body" tone="secondary">
          {fr.artisan.nextSlotPrefix}
          <Text variant="body" className="font-body-bold">
            {nextSlotLabel}
          </Text>
        </Text>
      ) : null}
    </View>
  );
}
