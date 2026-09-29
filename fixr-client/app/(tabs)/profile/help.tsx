import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

/** Pas de maquette dédiée — style de Profile.dc.html (docs/ECRANS.md). */
export default function Help() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Aide' }} />
      <ScreenPlaceholder
        title="Aide"
        route="(tabs)/profile/help"
        description="Lot 7 — pas de maquette dédiée"
      />
    </>
  );
}
