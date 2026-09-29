import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function Login() {
  return (
    <>
      <Stack.Screen options={{ title: 'Connexion' }} />
      <ScreenPlaceholder
        title="03 · Connexion"
        route="(auth)/login"
        description="Lot 2 — design/Login.dc.html (onglets Téléphone / E-mail)"
        links={[
          { label: 'Code SMS →', href: '/verify-otp' },
          { label: 'Inscription →', href: '/signup' },
        ]}
      />
    </>
  );
}
