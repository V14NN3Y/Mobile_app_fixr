import { Stack, useLocalSearchParams } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

/**
 * Route racine, hors (tabs) : s'affiche par-dessus la barre d'onglets, qui n'y est
 * donc structurellement jamais visible (design/Architecture.dc.html).
 */
export default function ArtisanProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Profil artisan' }} />
      <ScreenPlaceholder
        title="09 · Profil artisan"
        route={`artisan/[id] · id=${id}`}
        description="Lot 3 — design/ArtisanProfile.dc.html + ArtisanStates.dc.html"
        links={[
          {
            label: 'Demander une intervention →',
            href: { pathname: '/request/need', params: { artisanId: id } },
          },
        ]}
      />
    </>
  );
}
