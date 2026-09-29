import { router, Stack } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

/**
 * Fin du flux : navigation replace vers Réservations (design/Architecture.dc.html),
 * jamais un push — on ne doit pas pouvoir revenir dans le flux de demande terminé.
 * ScreenPlaceholder.links fait toujours un push : on passe par `extra` pour ce cas précis.
 */
export default function RequestSuccess() {
  return (
    <>
      <Stack.Screen options={{ title: 'Demande envoyée', headerBackVisible: false }} />
      <ScreenPlaceholder
        title="13b · Demande envoyée"
        route="request/success"
        description="Lot 4 — design/RequestSuccess.dc.html (animation du check, numéro FX- copiable)"
        extra={
          <Button variant="primary" onPress={() => router.replace('/bookings')}>
            Voir mes réservations →
          </Button>
        }
      />
    </>
  );
}
