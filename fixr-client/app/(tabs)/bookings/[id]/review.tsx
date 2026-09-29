import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function Review() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Évaluation' }} />
      <ScreenPlaceholder
        title="18 · Évaluation"
        route="(tabs)/bookings/[id]/review"
        description="Lot 5 — design/Review.dc.html (note, critères, commentaire, photo)"
        links={[{ label: 'Réservations →', href: '/bookings' }]}
      />
    </>
  );
}
