import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

/** Pas de maquette dédiée — style de Profile.dc.html (docs/ECRANS.md). */
export default function Favorites() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Favoris' }} />
      <ScreenPlaceholder
        title="Favoris"
        route="(tabs)/profile/favorites"
        description="Lot 7 — pas de maquette dédiée"
      />
    </>
  );
}
