// Aides partagées par toutes les Edge Functions du Lot 8 : client service_role (contourne
// RLS — c'est la seule voie autorisée pour les écritures listées dans
// docs/MODELE-DONNEES.md), et résolution de l'utilisateur appelant à partir de son JWT.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

export function serviceRoleClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
}

/** Vérifie le JWT de la requête et retourne l'id de l'utilisateur appelant, ou null. */
export async function getCallerId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}

// CORS : aucune en-tête n'est ajoutée par défaut par le gateway Kong local — sans ça,
// chaque appel depuis le navigateur (supabase.functions.invoke, Lot 8) échoue au préflight
// OPTIONS (constaté : testé par curl pendant le développement, où CORS ne s'applique
// jamais, ça cachait le problème jusqu'au premier test depuis l'app réelle).
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** À appeler en tête de chaque Deno.serve : court-circuite le préflight OPTIONS. */
export function handlePreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  return null;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}
