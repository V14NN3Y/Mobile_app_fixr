/**
 * Carte d'appel de secours hors connexion (design/StatesA.dc.html col. 4) — épinglée
 * au-dessus de la saisie quand le Chat est hors ligne : l'appel fonctionne sans internet.
 */
import { Linking, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';

export type OfflineCallCardProps = { artisanFirstName: string; phone?: string };

export function OfflineCallCard({ artisanFirstName, phone }: OfflineCallCardProps) {
  const t = fr.messages.chat;

  return (
    <View className="mx-5 mb-3 gap-2.5 rounded-2xl border border-border-subtle bg-surface p-3.5">
      <Text variant="label" className="font-body-bold">
        {t.offlineUrgentTitle}
      </Text>
      <Button
        variant="primary"
        size="md"
        icon="call"
        disabled={!phone}
        onPress={() => phone && void Linking.openURL(`tel:${phone}`)}
      >
        {t.offlineCallCta(artisanFirstName)}
      </Button>
    </View>
  );
}
