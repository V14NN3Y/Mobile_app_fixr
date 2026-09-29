import { Stack, useLocalSearchParams } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

/** Tab bar masquée sur cet écran (voir src/components/navigation/TabBar.tsx, useHideTabBar). */
export default function Chat() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Chat' }} />
      <ScreenPlaceholder
        title="20 · Chat"
        route={`(tabs)/messages/[threadId] · threadId=${threadId}`}
        description="Lot 6 — design/Chat.dc.html (carte mission épinglée, réponses rapides) — tab bar masquée"
        links={[{ label: 'Carte mission → Détail réservation', href: '/bookings/FX-24817' }]}
      />
    </>
  );
}
