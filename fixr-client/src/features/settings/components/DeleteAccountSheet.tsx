/**
 * Feuille de suppression de compte — design/Settings.dc.html. Case d'acquiescement rouge
 * (Checkbox tone="danger") : le bouton de confirmation reste désactivé tant qu'elle n'est
 * pas cochée. `ack` se réinitialise à chaque ouverture (géré par l'écran appelant, qui
 * recrée/réaffiche cette feuille).
 */
import { forwardRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon } from '@/components/ui/Icon';
import { Sheet, type SheetRef } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

export type DeleteAccountSheetRef = SheetRef;

export type DeleteAccountSheetProps = {
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const DeleteAccountSheet = forwardRef<DeleteAccountSheetRef, DeleteAccountSheetProps>(
  function DeleteAccountSheet({ loading = false, onConfirm, onCancel }, ref) {
    const { colors } = useTheme();
    const t = fr.settings.deleteAccount;
    const [ack, setAck] = useState(false);

    return (
      <Sheet ref={ref} onDismiss={() => setAck(false)}>
        <View className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-danger-soft">
          <Icon name="trash" size={24} color={colors.danger} />
        </View>
        <Text variant="title2" className="font-display">
          {t.sheetTitle}
        </Text>
        <Text variant="caption" tone="secondary">
          {t.body}
        </Text>

        {/* Checkbox et le texte sont deux Pressable frères (pas l'un dans l'autre) — même
            discipline que TermsCheckbox.tsx (Lot 2) : un Pressable imbriqué casse le bascule
            sur web (le clic remonte jusqu'au conteneur externe qui rebascule aussitôt). */}
        <View className="flex-row items-start gap-3">
          <View className="pt-0.5">
            <Checkbox checked={ack} onChange={setAck} tone="danger" accessibilityLabel={t.ack} />
          </View>
          <Pressable onPress={() => setAck((v) => !v)} className="flex-1" accessible={false}>
            <Text variant="label" className="font-body-bold">
              {t.ack}
            </Text>
          </Pressable>
        </View>

        <View className="gap-2.5 pt-1.5">
          <Button variant="destructive" disabled={!ack} loading={loading} onPress={onConfirm}>
            {t.confirm}
          </Button>
          <Button variant="secondary" onPress={onCancel}>
            {t.cancel}
          </Button>
        </View>
      </Sheet>
    );
  },
);
