/**
 * Client Supabase partagé (Lot 8). N'est utilisé que lorsque USE_MOCKS est faux — importé
 * uniquement par les api.supabase.ts de chaque feature, jamais directement par les écrans
 * (même discipline que src/mocks/api.ts : les écrans ne passent que par les hooks.ts de
 * chaque feature).
 */
import { createClient } from '@supabase/supabase-js';

import { ApiError } from './apiError';
import { supabaseStorage } from './supabaseStorage';

// Chaque features/<domaine>/api.ts importe INCONDITIONNELLEMENT api.mock.ts ET
// api.supabase.ts (le dispatcher choisit ensuite lequel appeler selon USE_MOCKS) — ce
// module s'exécute donc aussi en mode mock / sous Jest, où aucune URL Supabase n'est
// configurée. createClient() avec une URL vide lève une erreur SYNCHRONE au chargement du
// module (constaté : ça faisait tout le test suite planter) ; un localhost de secours
// garde le client valide mais inerte, puisqu'il n'est jamais réellement appelé dans ce cas
// (tous les appels réels passent par USE_MOCKS, voir src/lib/env.ts).
const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:55321';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-unused-in-mock-mode';

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Id de l'utilisateur connecté — requis par tout insert direct (owner_id, client_id…).
 * `getSession()` (lecture locale, synchrone en pratique) plutôt que `getUser()`
 * (round-trip réseau systématique, même avec une session locale valide) : constaté en
 * testant le Chat hors connexion (Lot 8) — avec `getUser()`, TOUT appel à cette fonction
 * échouait dès que le réseau tombait, y compris pour relire une conversation déjà en cache,
 * bloquant l'écran entier sur "Conversation introuvable" au lieu de laisser composer un
 * message à mettre en file. Pas un recul de sécurité : la vérification serveur du JWT a de
 * toute façon lieu à chaque requête via RLS, indépendamment de ce que le client prétend ici.
 */
export async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new ApiError('Non authentifié', 401);
  return data.session.user.id;
}
