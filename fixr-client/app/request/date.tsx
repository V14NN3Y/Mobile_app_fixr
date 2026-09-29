import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function RequestDate() {
  return (
    <>
      <Stack.Screen options={{ title: 'Date' }} />
      <ScreenPlaceholder
        title="12 · Demande — Date"
        route="request/date"
        description="Lot 4 — design/RequestDate.dc.html (raccourcis, bandeau de jours, créneaux)"
        links={[{ label: 'Confirmation →', href: '/request/confirm' }]}
      />
    </>
  );
}
