import { Stack } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';
import { useSessionStore } from '@/features/auth/store';

export default function Welcome() {
  const signIn = useSessionStore((s) => s.signIn);

  return (
    <>
      <Stack.Screen options={{ title: 'Bienvenue' }} />
      <ScreenPlaceholder
        title="01 · Bienvenue"
        route="(auth)/welcome"
        description="Lot 2 — design/Main.dc.html"
        links={[
          { label: 'Onboarding →', href: '/onboarding' },
          { label: 'Connexion →', href: '/login' },
          { label: 'Inscription →', href: '/signup' },
        ]}
        extra={
          <Button
            variant="primary"
            onPress={() => signIn({ userId: 'u_aurore', phone: '+2290197451236' })}
          >
            Simuler la connexion (dev)
          </Button>
        }
      />
    </>
  );
}
