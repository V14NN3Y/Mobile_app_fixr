import { Stack } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';
import { useSessionStore } from '@/features/auth/store';

export default function VerifyOtp() {
  const signIn = useSessionStore((s) => s.signIn);

  return (
    <>
      <Stack.Screen options={{ title: 'Code SMS' }} />
      <ScreenPlaceholder
        title="03b · Code SMS"
        route="(auth)/verify-otp"
        description="Lot 2 — design/Otp.dc.html (6 cases, autofill SMS, renvoi avec compte à rebours)"
        extra={
          <Button
            variant="primary"
            onPress={() => signIn({ userId: 'u_aurore', phone: '+2290197451236' })}
          >
            Simuler le code confirmé (dev) → (tabs)
          </Button>
        }
      />
    </>
  );
}
