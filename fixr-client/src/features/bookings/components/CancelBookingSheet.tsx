/**
 * Feuille d'annulation — design/BookingDetail.dc.html + design/StatesB.dc.html col. 2.
 * Texte du corps reconcilié entre les deux sources maquette : StatesB ajoute la clause de
 * frais après l'échéance, absente du propre modal de BookingDetail.dc.html — version
 * retenue car plus complète, pas une invention.
 */
import { forwardRef, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Sheet, type SheetRef } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { formatFCFA, formatWeekdayDateTime } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

export type CancelReason = 'resolved' | 'dateChanged' | 'tooExpensive' | 'other';

const REASONS: CancelReason[] = ['resolved', 'dateChanged', 'tooExpensive', 'other'];

export type CancelBookingSheetRef = SheetRef;

export type CancelBookingSheetProps = {
  artisanFirstName: string;
  cancellableUntil: string;
  fee: number;
  onConfirm: (reason: CancelReason | null) => void;
  onKeep: () => void;
};

export const CancelBookingSheet = forwardRef<CancelBookingSheetRef, CancelBookingSheetProps>(
  function CancelBookingSheet({ artisanFirstName, cancellableUntil, fee, onConfirm, onKeep }, ref) {
    const { colors } = useTheme();
    const t = fr.bookings.cancel;
    const [reason, setReason] = useState<CancelReason | null>(null);

    return (
      <Sheet ref={ref}>
        <View className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-danger-soft">
          <Icon name="cancel" size={24} color={colors.danger} />
        </View>
        <Text variant="title2" className="font-display">
          {t.title}
        </Text>
        <Text variant="body" tone="secondary">
          {t.body(artisanFirstName, formatWeekdayDateTime(cancellableUntil), formatFCFA(fee))}
        </Text>

        <View className="gap-2.5">
          <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
            {t.reasonLabel}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {REASONS.map((r) => (
              <Chip
                key={r}
                variant={reason === r ? 'selected' : 'default'}
                onPress={() => setReason(reason === r ? null : r)}
              >
                {t.reasons[r]}
              </Chip>
            ))}
          </View>
        </View>

        <View className="gap-2.5 pt-1.5">
          <Button variant="destructive" onPress={() => onConfirm(reason)}>
            {t.confirm}
          </Button>
          <Button variant="secondary" onPress={onKeep}>
            {t.keep}
          </Button>
        </View>
      </Sheet>
    );
  },
);
