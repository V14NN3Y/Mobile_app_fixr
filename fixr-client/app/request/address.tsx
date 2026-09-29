import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function RequestAddress() {
  return (
    <>
      <Stack.Screen options={{ title: 'Adresse' }} />
      <ScreenPlaceholder
        title="11 · Demande — Adresse"
        route="request/address"
        description="Lot 4 — design/RequestAddress.dc.html (adresses enregistrées, position, mini-carte)"
        links={[{ label: 'Date →', href: '/request/date' }]}
      />
    </>
  );
}
