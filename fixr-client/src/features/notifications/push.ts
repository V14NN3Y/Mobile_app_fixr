/**
 * Préparation expo-notifications — permission (demandée au bon moment, jamais au lancement,
 * voir app/notifications.tsx) + une notification locale de démonstration programmée après
 * l'octroi, pour que « toucher une notification ouvre le bon écran » soit vérifiable via une
 * vraie notification OS, pas seulement une ligne de liste in-app. Aucun envoi serveur ici
 * (Lot 9) — uniquement de la planification locale, qui ne nécessite aucun backend.
 * Web : pas de planification locale fiable, tout ce module est gardé par Platform.OS.
 */
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { resolveDeepLink } from '@/lib/deepLink';
import type { NotificationType } from '@/types/domain';

import { registerPushToken } from './api';

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
 * Capture + enregistre le jeton Expo Push, appelée juste après l'octroi de permission
 * (comme scheduleDemoNotification). `getExpoPushTokenAsync` exige un `projectId` EAS
 * (app.json > extra.eas.projectId, généré par `eas init`) — absent tant qu'aucun compte
 * EAS n'existe (Lot 9, décision actée) : échec attendu et silencieux dans cet
 * environnement, exactement comme la planification locale ci-dessus en cas d'échec.
 */
export async function registerPushTokenIfPossible(): Promise<void> {
  if (Platform.OS === 'web') return;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return;
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
  } catch {
    // Pas de projectId valide, pas de réseau, jeton refusé… n'importe quel échec ici ne
    // doit jamais empêcher l'utilisateur de voir/activer les notifications in-app.
  }
}

/**
 * Les 9 types de NotificationType, un exemple par type (textes/liens repris de
 * supabase/seed.sql quand ils existent, pour rester cohérent avec les fixtures déjà
 * utilisées ailleurs) — support de la section de test __DEV__ de app/notifications.tsx.
 */
export const DEMO_NOTIFICATIONS_BY_TYPE: Record<
  NotificationType,
  { title: string; body: string; deepLink: string }
> = {
  request_accepted: {
    title: 'Devis accepté',
    body: 'Votre devis pour « Fuite sous l’évier » a été accepté.',
    deepLink: 'fixr://bookings/FX-24817',
  },
  quote_received: {
    title: 'Nouveau devis reçu',
    body: 'Fabrice propose 18 000 FCFA pour l’entretien de votre climatiseur.',
    deepLink: 'fixr://bookings/FX-25103',
  },
  on_the_way: {
    title: 'L’artisan est en route',
    body: 'Koffi arrive dans 12 min pour « Fuite sous l’évier ».',
    deepLink: 'fixr://bookings/FX-24817/live',
  },
  message: {
    title: 'Nouveau message de Koffi',
    body: '« Je passe Cadjèhoun, j’arrive dans 10 min. »',
    deepLink: 'fixr://messages/dddddddd-0000-0000-0000-000000000001',
  },
  booking_changed: {
    title: 'Mission modifiée',
    body: 'Christelle a avancé l’heure : jeu. 1 oct. à 08:00 au lieu de 09:00.',
    deepLink: 'fixr://bookings/FX-24990',
  },
  report_ready: {
    title: 'Le rapport d’intervention est disponible',
    body: 'Remplacement disjoncteur · Rodrigue Dossou',
    deepLink: 'fixr://bookings/FX-24402/report',
  },
  payment: {
    title: 'Paiement confirmé',
    body: '18 000 FCFA payés à Rodrigue par Mobile Money.',
    deepLink: 'fixr://bookings/FX-24402/report',
  },
  review_request: {
    title: 'Rodrigue attend votre avis',
    body: 'Votre retour aide les autres clients à choisir.',
    deepLink: 'fixr://bookings/FX-24402/review',
  },
  security: {
    title: 'Nouvelle connexion',
    body: 'Connexion depuis un téléphone Android à Cotonou. Ce n’était pas vous ?',
    deepLink: 'fixr://profile/settings',
  },
};

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
