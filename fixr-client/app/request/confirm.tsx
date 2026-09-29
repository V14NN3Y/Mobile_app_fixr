import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function RequestConfirm() {
  return (
    <>
      <Stack.Screen options={{ title: 'Confirmation' }} />
      <ScreenPlaceholder
        title="13 · Demande — Confirmation"
        route="request/confirm"
        description="Lot 4 — design/RequestConfirm.dc.html (résumé, liens Modifier, encart « À savoir »)"
        links={[{ label: 'Envoyer la demande →', href: '/request/success' }]}
      />
    </>
  );
}
