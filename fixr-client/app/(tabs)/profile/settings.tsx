import { Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function Settings() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Paramètres' }} />
      <ScreenPlaceholder
        title="23 · Paramètres"
        route="(tabs)/profile/settings"
        description="Lot 7 — design/Settings.dc.html (biométrie, notifications, apparence, langue)"
      />
    </>
  );
}
