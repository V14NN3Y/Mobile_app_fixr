import { router, Stack } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function RequestNeed() {
  return (
    <>
      <Stack.Screen options={{ title: 'Besoin' }} />
      <ScreenPlaceholder
        title="10 · Demande — Besoin"
        route="request/need"
        description="Lot 4 — design/RequestNeed.dc.html (catégories, titre, description, photos, urgence)"
        links={[{ label: 'Adresse →', href: '/request/address' }]}
        extra={
          <Button variant="secondary" onPress={() => router.back()}>
            Fermer
          </Button>
        }
      />
    </>
  );
}
