/**
 * Enveloppe `usePostHog()` (Lot 9) — le client est `undefined` tant qu'aucune clé API
 * n'existe (src/lib/posthog.ts, aucun compte PostHog créé encore dans cet environnement) :
 * un appel direct à `usePostHog().capture(...)` planterait alors l'écran. Même discipline
 * que scheduleDemoNotification/registerPushTokenIfPossible : l'analytique ne doit jamais
 * faire échouer le tunnel de demande qu'elle observe.
 */
import { usePostHog } from 'posthog-react-native';
import type { PostHogEventProperties } from '@posthog/core';

export function useAnalytics() {
  const posthog = usePostHog();
  return {
    capture: (event: string, properties?: PostHogEventProperties) => {
      posthog?.capture(event, properties);
    },
  };
}
