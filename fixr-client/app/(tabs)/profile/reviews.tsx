import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

/** Pas de maquette dédiée — style de Profile.dc.html (docs/ECRANS.md). */
export default function Reviews() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Mes avis' }} />
      <ScreenPlaceholder
        title="Mes avis"
        route="(tabs)/profile/reviews"
        description="Lot 7 — pas de maquette dédiée"
      />
    </>
  );
}
