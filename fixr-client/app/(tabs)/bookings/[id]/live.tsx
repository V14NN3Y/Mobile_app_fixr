import { Stack, useLocalSearchParams } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

/** Tab bar masquée sur cet écran (voir src/components/navigation/TabBar.tsx, useHideTabBar). */
export default function MissionLive() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Mission en cours' }} />
      <ScreenPlaceholder
        title="16 · Mission en cours"
        route="(tabs)/bookings/[id]/live"
        description="Lot 5 — design/MissionLive.dc.html (sombre : MissionDark.dc.html) — tab bar masquée"
        links={[
          { label: 'Rapport →', href: `/bookings/${id}/report` },
          { label: 'Chat →', href: '/messages/c_koffi' },
        ]}
      />
    </>
  );
}
