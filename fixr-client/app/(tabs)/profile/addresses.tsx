import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

/** Pas de maquette dédiée — à dériver de StatesB.dc.html (col. 3) + RequestAddress.dc.html. */
export default function Addresses() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Mes adresses' }} />
      <ScreenPlaceholder
        title="Mes adresses"
        route="(tabs)/profile/addresses"
        description="Lot 7 — pas de maquette dédiée"
      />
    </>
  );
}
