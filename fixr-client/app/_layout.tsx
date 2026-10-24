/**
 * Racine de l'app : polices, splash, thème, providers globaux, pile de navigation.
 * Stack.Protected arbitre (auth) vs (tabs)+request+artisan+filters+notifications selon la
 * session (store fictif du Lot 1, src/features/auth/store.ts) — pas de redirection
 * manuelle dans un app/index.tsx : quand la garde d'un écran devient fausse (y compris
 * pour un lien profond ciblant directement un écran protégé), Expo Router bascule seul
 * vers la première route disponible côté autorisé.
 */
import '@/theme/global.css';

import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PostHogProvider } from 'posthog-react-native';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OfflineBannerProvider } from '@/components/ui/OfflineBanner';
import { ToastProvider } from '@/components/ui/Toast';
import { useSessionBridge } from '@/features/auth/sessionBridge';
import { useSessionStore } from '@/features/auth/store';
import { useSyncFavorites } from '@/features/favorites/hooks';
import { useGlobalOutboxDrain } from '@/features/messages/hooks';
import { useNotificationResponseRouter } from '@/features/notifications/push';
import { queryClient } from '@/lib/queryClient';
import { POSTHOG_API_KEY, posthogOptions } from '@/lib/posthog';
import { initSentry, Sentry } from '@/lib/sentry';
import { ThemeProvider } from '@/theme/ThemeProvider';

void SplashScreen.preventAutoHideAsync();
initSentry();

// useSyncFavorites() a besoin de QueryClientProvider comme ancêtre — impossible à appeler
// directement dans RootLayout (qui RENDS ce provider, mais n'est pas lui-même son
// descendant). Petit composant sans rendu, monté juste à l'intérieur.
function FavoritesSync() {
  useSyncFavorites();
  return null;
}

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const hasSession = useSessionStore((s) => s.session !== null);
  useSessionBridge();
  useNotificationResponseRouter();
  useGlobalOutboxDrain();

  const ready = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  // Garde l'écran de démarrage tant que les polices ne sont pas prêtes (CLAUDE.md, Lot 0).
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostHogProvider apiKey={POSTHOG_API_KEY} options={posthogOptions}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ThemeProvider>
              <BottomSheetModalProvider>
                <ToastProvider>
                  <OfflineBannerProvider>
                    <FavoritesSync />
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Protected guard={!hasSession}>
                        <Stack.Screen name="(auth)" />
                      </Stack.Protected>

                      <Stack.Protected guard={hasSession}>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="request" options={{ presentation: 'modal' }} />
                        <Stack.Screen name="artisan/[id]" options={{ headerShown: true }} />
                        <Stack.Screen
                          name="filters"
                          options={{ presentation: 'formSheet', headerShown: true }}
                        />
                        <Stack.Screen name="notifications" options={{ headerShown: true }} />
                      </Stack.Protected>
                    </Stack>
                  </OfflineBannerProvider>
                </ToastProvider>
              </BottomSheetModalProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
