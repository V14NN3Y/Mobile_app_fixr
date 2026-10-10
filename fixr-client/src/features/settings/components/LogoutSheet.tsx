/**
 * Feuille de déconnexion — design/Settings.dc.html. Texte dynamique dérivé de la vraie
 * mission active (useHomeData, même dérivation que l'Accueil) — pas de mission en cours →
 * corps générique.
 */
import { forwardRef } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Sheet, type SheetRef } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';

export type LogoutSheetRef = SheetRef;

export type LogoutSheetProps = {
  activeMissionId: string | null;
  onConfirm: () => void;
  onKeep: () => void;
};

export const LogoutSheet = forwardRef<LogoutSheetRef, LogoutSheetProps>(function LogoutSheet(
  { activeMissionId, onConfirm, onKeep },
  ref,
) {
  const t = fr.settings.logout;

  return (
    <Sheet ref={ref}>
      <Text variant="title2" className="font-display">
        {t.sheetTitle}
      </Text>
      <Text variant="body" tone="secondary">
        {activeMissionId ? t.bodyWithMission(activeMissionId) : t.bodyGeneric}
      </Text>
      <View className="gap-2.5 pt-1.5">
        <Button variant="ink" onPress={onConfirm}>
          {t.confirm}
        </Button>
        <Button variant="secondary" onPress={onKeep}>
          {t.cancel}
        </Button>
      </View>
    </Sheet>
  );
});
