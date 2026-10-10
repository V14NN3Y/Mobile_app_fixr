/**
 * Préparation expo-notifications — permission (demandée au bon moment, jamais au lancement,
 * voir app/notifications.tsx) + une notification locale de démonstration programmée après
 * l'octroi, pour que « toucher une notification ouvre le bon écran » soit vérifiable via une
 * vraie notification OS, pas seulement une ligne de liste in-app. Aucun envoi serveur ici
 * (Lot 9) — uniquement de la planification locale, qui ne nécessite aucun backend.
 * Web : pas de planification locale fiable, tout ce module est gardé par Platform.OS.
 */
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { resolveDeepLink } from '@/lib/deepLink';

const ANDROID_CHANNEL_ID = 'default';
const DEMO_DELAY_SECONDS = 6;

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Général',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

type PermissionStatus = Notifications.NotificationPermissionsStatus['status'];

export async function getNotificationPermissionStatus(): Promise<PermissionStatus | 'unsupported'> {
  if (Platform.OS === 'web') return 'unsupported';
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestNotificationPermission(): Promise<PermissionStatus | 'unsupported'> {
  if (Platform.OS === 'web') return 'unsupported';
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

/** Programme une notification locale dans quelques secondes — jamais bloquant. */
export async function scheduleDemoNotification(title: string, body: string, deepLink: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await ensureAndroidChannel();
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { deepLink } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: DEMO_DELAY_SECONDS },
    });
  } catch {
    // La démo ne doit jamais bloquer l'écran Notifications si la planification échoue
    // (simulateur sans capacité de notification, permission révoquée entre-temps…).
  }
}

/**
 * Écouteur de réponse (tap) aux notifications OS — posé une fois dans app/_layout.tsx.
 * Résout `deepLink` via le même resolveDeepLink() que la liste in-app : un seul chemin
 * testé pour les deux (src/lib/__tests__/deepLink.test.ts).
 */
export function useNotificationResponseRouter(): void {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const deepLink = response.notification.request.content.data?.deepLink;
      if (typeof deepLink !== 'string') return;
      const href = resolveDeepLink(deepLink);
      if (href) router.push(href);
    });
    return () => subscription.remove();
  }, []);
}
