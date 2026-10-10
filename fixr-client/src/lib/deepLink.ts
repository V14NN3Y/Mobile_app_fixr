/**
 * Résolution des liens fixr:// — table de docs/ECRANS.md (§ Liens profonds), consommée à la
 * fois par la liste de notifications (tap d'une ligne) et par l'écouteur de réponse aux
 * notifications OS (src/features/notifications/push.ts) : un seul chemin testé pour les deux.
 */
import type { Href } from 'expo-router';

export function resolveDeepLink(url: string): Href | null {
  const parts = url.replace(/^fixr:\/\//, '').split('/').filter(Boolean);

  if (parts[0] === 'bookings' && parts[1]) {
    const id = parts[1];
    if (parts[2] === 'live') return `/bookings/${id}/live`;
    if (parts[2] === 'report') return `/bookings/${id}/report`;
    if (parts[2] === 'review') return `/bookings/${id}/review`;
    if (!parts[2]) return `/bookings/${id}`;
    return null;
  }

  if (parts[0] === 'messages' && parts[1]) return `/messages/${parts[1]}`;
  if (parts[0] === 'profile' && parts[1] === 'settings') return '/profile/settings';

  return null;
}
