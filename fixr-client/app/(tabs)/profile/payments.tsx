import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

/** Pas de maquette dédiée — style de Profile.dc.html (docs/ECRANS.md). */
export default function Payments() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Moyens de paiement' }} />
      <ScreenPlaceholder
        title="Moyens de paiement"
        route="(tabs)/profile/payments"
        description="Lot 7 — pas de maquette dédiée"
      />
    </>
  );
}
