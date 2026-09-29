import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

/** Route racine, hors (tabs) (design/Architecture.dc.html). */
export default function Notifications() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Notifications' }} />
      <ScreenPlaceholder
        title="21 · Notifications"
        route="notifications"
        description="Lot 6 — design/Notifications.dc.html (groupes par date, Tout marquer comme lu)"
        links={[{ label: 'Mission en cours (FX-24817) →', href: '/bookings/FX-24817/live' }]}
      />
    </>
  );
}
