/**
 * PostHog (Lot 9) — clé vide = aucun compte créé encore dans cet environnement ;
 * PostHogProvider (app/_layout.tsx) reste monté sans apiKey dans ce cas (usePostHog()
 * retourne alors undefined), d'où src/lib/analytics.ts qui protège chaque appel capture().
 *
 * `customStorage` : MMKV (déjà la seule persistance locale utilisée dans ce dépôt, voir
 * src/lib/storage.ts) plutôt que les stockages par défaut de PostHog (async-storage/
 * expo-file-system, aucun des deux en dépendance ici) — évite d'ajouter une dépendance
 * supplémentaire pour un simple cache de distinct_id/événements en attente d'envoi.
 */
import type { PostHogOptions } from 'posthog-react-native';

import { storage } from './storage';

export const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
export const POSTHOG_ENABLED = Boolean(POSTHOG_API_KEY);

export const posthogOptions: PostHogOptions = {
  host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  customStorage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  },
};
