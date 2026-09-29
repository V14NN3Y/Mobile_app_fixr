import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function Signup() {
  return (
    <>
      <Stack.Screen options={{ title: 'Inscription' }} />
      <ScreenPlaceholder
        title="04 · Inscription"
        route="(auth)/signup"
        description="Lot 2 — design/Signup.dc.html + design/SignupErrors.dc.html"
        links={[{ label: 'Code SMS →', href: '/verify-otp' }]}
      />
    </>
  );
}
