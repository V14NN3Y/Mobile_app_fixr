import { Stack, useLocalSearchParams } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function Report() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Rapport d'intervention" }} />
      <ScreenPlaceholder
        title="17 · Rapport d'intervention"
        route="(tabs)/bookings/[id]/report"
        description="Lot 5 — design/Report.dc.html (avant/après, matériel, total, PDF)"
        links={[{ label: 'Évaluation →', href: `/bookings/${id}/review` }]}
      />
    </>
  );
}
