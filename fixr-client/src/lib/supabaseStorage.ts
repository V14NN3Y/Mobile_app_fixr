/**
 * Adaptateur MMKV → interface storage attendue par @supabase/supabase-js pour persister la
 * session (jeton d'accès/de rafraîchissement). Réutilise l'instance MMKV déjà partagée par
 * tous les stores zustand de l'app (src/lib/storage.ts) — pas de 2e dépendance de stockage
 * (pas d'AsyncStorage).
 *
 * Garde SSR : Expo Router en mode web fait un premier rendu côté serveur (Node, sans DOM).
 * supabase-js lit la session de façon synchrone dès la construction du client
 * (`_emitInitialSession`), contrairement au middleware `persist` de zustand (utilisé
 * partout ailleurs dans l'app) qui diffère son hydratation — c'est pour ça que ce fichier a
 * besoin de sa propre garde alors qu'aucun autre store MMKV n'en avait eu besoin jusqu'ici.
 * Sans elle : "Tried to access storage on the server. Did you forget to call this in
 * useEffect?" (constaté en lançant `expo start --web`). `document` n'existe ni en SSR ni en
 * natif ; `Platform.OS === 'web'` les distingue (natif : toujours le vrai MMKV).
 */
import { Platform } from 'react-native';

import { storage } from './storage';

const isServerSideRender = Platform.OS === 'web' && typeof document === 'undefined';

export const supabaseStorage = {
  getItem: (key: string): string | null => {
    if (isServerSideRender) return null;
    return storage.getString(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    if (isServerSideRender) return;
    storage.set(key, value);
  },
  removeItem: (key: string): void => {
    if (isServerSideRender) return;
    storage.remove(key);
  },
};
