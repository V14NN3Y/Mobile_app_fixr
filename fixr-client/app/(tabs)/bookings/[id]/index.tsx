import { Stack, useLocalSearchParams } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: `Réservation ${id}` }} />
      <ScreenPlaceholder
        title="15 · Détail réservation"
        route="(tabs)/bookings/[id]/index"
        description="Lot 5 — design/BookingDetail.dc.html (timeline, artisan, prix, annulation)"
        links={[
          { label: 'Mission en cours →', href: `/bookings/${id}/live` },
          { label: 'Rapport →', href: `/bookings/${id}/report` },
          { label: 'Évaluation →', href: `/bookings/${id}/review` },
        ]}
      />
    </>
  );
}
