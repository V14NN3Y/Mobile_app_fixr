/**
 * Carte réservation — design/Bookings.dc.html. Enveloppe `Card` (conteneur générique déjà
 * prévu pour ça). Le statut utilise `<Badge mode="status">`, qui couvre déjà les 8 statuts
 * avec les bonnes couleurs — pas de carte de couleurs parallèle comme dans la maquette.
 */
import { Pressable, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import type { BookingCta } from '@/features/bookings/cta';
import { formatFCFA, formatFCFARange, formatWeekdayDateTime, getInitials, ON_QUOTE } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { Address, Artisan, Booking } from '@/types/domain';

import { Card } from '../ui/Card';

const t = fr.bookings.card;

export type BookingCardProps = {
  booking: Booking;
  artisan?: Artisan;
  address?: Address;
  cta: BookingCta;
  onPress: () => void;
  onCtaPress?: () => void;
  testID?: string;
};

function priceRow(booking: Booking): { label: string; value: string } {
  if (booking.status === 'quotes') {
    return {
      label: t.quoteFrom,
      value: booking.priceEstimate ? formatFCFARange(booking.priceEstimate.min, booking.priceEstimate.max) : ON_QUOTE,
    };
  }
  if (booking.status === 'cancelled') {
    return { label: t.cancellationFee, value: formatFCFA(0) };
  }
  if (booking.status === 'done') {
    return { label: t.amountPaid, value: formatFCFA(booking.priceFinal) };
  }
  if (booking.priceEstimate) {
    return { label: t.estimatedPrice, value: formatFCFARange(booking.priceEstimate.min, booking.priceEstimate.max) };
  }
  return { label: t.estimatedPrice, value: formatFCFA(booking.budget) };
}

function whoLabel(booking: Booking, artisan: Artisan | undefined): string {
  if (!artisan) {
    if (booking.status === 'quotes' && booking.quotesCount !== undefined) {
      return t.quotesReceived(booking.quotesCount);
    }
    return t.openSearch;
  }
  if (booking.status === 'cancelled') {
    return t.cancelledBy(`${artisan.firstName} ${artisan.lastName}`, booking.cancelledBy === 'client');
  }
  return `${artisan.firstName} ${artisan.lastName} · ${artisan.trade}`;
}

export function BookingCard({ booking, artisan, address, cta, onPress, onCtaPress, testID }: BookingCardProps) {
  const { colors, categoryTints } = useTheme();
  const price = priceRow(booking);
  const tint = categoryTints[booking.categoryId];

  return (
    <Card testID={testID} className="gap-0 p-0">
      <Pressable onPress={onPress} accessibilityRole="button" className="gap-3 p-3.5">
        <View className="flex-row items-center justify-between">
          <Badge mode="status" status={booking.status} />
          <Text variant="caption" tone="secondary">
            {booking.id}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {artisan ? (
            <Avatar initials={getInitials(artisan.firstName, artisan.lastName)} seed={artisan.id} size={46} />
          ) : (
            <View
              className="h-[46px] w-[46px] items-center justify-center rounded-full"
              style={{ backgroundColor: tint.bg }}
            >
              <Icon name={booking.categoryId} size={20} color={tint.ink} />
            </View>
          )}
          <View className="min-w-0 flex-1 gap-0.5">
            <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
              {booking.title}
            </Text>
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {whoLabel(booking, artisan)}
            </Text>
          </View>
          <Icon name="chevronRight" size={18} color={colors.textTertiary} />
        </View>

        <View className="gap-2 border-t border-border-subtle pt-3">
          <View className="flex-row items-center gap-2">
            <Icon name="calendar" size={14} color={colors.textTertiary} />
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {formatWeekdayDateTime(booking.slotStart)}
            </Text>
          </View>
          {address ? (
            <View className="flex-row items-center gap-2">
              <Icon name="location" size={14} color={colors.textTertiary} />
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                {address.label} · {address.neighborhood}, {address.city}
              </Text>
            </View>
          ) : null}
          <View className="flex-row items-center justify-between pt-0.5">
            <Text variant="caption" tone="secondary">
              {price.label}
            </Text>
            <Text variant="label" className="font-body-extrabold">
              {price.value}
            </Text>
          </View>
        </View>
      </Pressable>

      {cta ? (
        <View className="px-3.5 pb-3.5">
          <Button variant="secondary" size="md" onPress={onCtaPress ?? onPress}>
            {cta.label}
          </Button>
        </View>
      ) : null}
    </Card>
  );
}
