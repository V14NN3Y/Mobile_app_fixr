/**
 * Timeline « Suivi » — design/BookingDetail.dc.html. États dérivés des événements réels
 * (features/bookings/timeline.ts), jamais d'index figé.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import type { TimelineStep } from '@/features/bookings/timeline';
import { AnimatedView } from '@/lib/animated';
import { formatTime, formatWeekdayDateTime } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { Booking } from '@/types/domain';

import { Icon } from '../ui/Icon';
import { Text } from '../ui/Text';

const TIMELINE_LABELS: Record<TimelineStep['type'], string> = fr.bookings.detail.timelineLabels;

export type MissionTimelineProps = {
  steps: TimelineStep[];
  booking: Pick<Booking, 'slotStart' | 'slotEnd'>;
  testID?: string;
};

function CurrentDot() {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const pulse = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (cancelled) return;
      setReduceMotion(v);
      if (!v) pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, false);
    });
    return () => {
      cancelled = true;
    };
  }, [pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0 : 0.35 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.8 }],
  }));

  return (
    <View className="h-7 w-7 items-center justify-center">
      {/* Pas de className sur un élément animé (voir Button.tsx) : Reanimated écraserait
          silencieusement le style déjà résolu par NativeWind sur natif — couleur passée
          directement via style, comme déjà fait pour le texte/l'icône de Button. */}
      <AnimatedView
        pointerEvents="none"
        style={[
          haloStyle,
          { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary },
        ]}
      />
      <View className="h-3.5 w-3.5 rounded-full bg-primary" />
    </View>
  );
}

function subtitleFor(step: TimelineStep, booking: Pick<Booking, 'slotStart' | 'slotEnd'>): string | null {
  if (step.state === 'done' && step.at) return formatWeekdayDateTime(step.at);
  if (step.type === 'on_the_way' && step.state !== 'done') {
    return `Prévue ${formatTime(booking.slotStart)} – ${formatTime(booking.slotEnd)}`;
  }
  return null;
}

export function MissionTimeline({ steps, booking, testID }: MissionTimelineProps) {
  const { colors } = useTheme();

  return (
    <View testID={testID}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <View key={`${step.type}-${i}`} className="flex-row gap-3">
            <View className="items-center">
              {step.state === 'done' ? (
                <View className="h-7 w-7 items-center justify-center rounded-full bg-success">
                  <Icon name="check" size={14} color={colors.onSuccess} />
                </View>
              ) : step.state === 'current' ? (
                <CurrentDot />
              ) : (
                <View className="h-7 w-7 rounded-full border-2 border-border-strong bg-surface" />
              )}
              {!isLast ? (
                <View
                  className={step.state === 'done' ? 'w-0.5 flex-1 bg-success' : 'w-0.5 flex-1 bg-border'}
                />
              ) : null}
            </View>
            <View className={isLast ? 'flex-1 pb-0' : 'flex-1 pb-4'}>
              <Text
                variant="label"
                className={step.state === 'current' ? 'font-body-extrabold' : 'font-body-bold'}
                tone={step.state === 'upcoming' ? 'secondary' : 'default'}
              >
                {TIMELINE_LABELS[step.type]}
              </Text>
              {subtitleFor(step, booking) ? (
                <Text variant="caption" tone="secondary">
                  {subtitleFor(step, booking)}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
