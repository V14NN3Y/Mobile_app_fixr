import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function Onboarding() {
  return (
    <>
      <Stack.Screen options={{ title: 'Onboarding' }} />
      <ScreenPlaceholder
        title="02 · Onboarding (3 slides)"
        route="(auth)/onboarding"
        description="Lot 2 — design/Onboarding1/2/3.dc.html (PagerView, indicateur animé, Passer/Suivant)"
        links={[
          { label: 'Connexion →', href: '/login' },
          { label: 'Inscription →', href: '/signup' },
        ]}
      />
    </>
  );
}
