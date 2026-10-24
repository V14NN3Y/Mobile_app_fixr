// send-push — Lot 9. Déclenchée automatiquement par un trigger Postgres (pg_net,
// migration 20261011001200_send_push_trigger.sql) after insert on notifications — jamais
// appelée directement par l'app. Pas de getCallerId() ici : l'appelant est la base de
// données elle-même (JWT service_role, qui satisfait déjà la vérification JWT de
// edge-runtime), pas un utilisateur authentifié.
import { z } from 'npm:zod@4';

import { errorResponse, handlePreflight, jsonResponse, serviceRoleClient } from '../_shared/client.ts';

const inputSchema = z.object({ notification_id: z.string().min(1) });

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const parsed = inputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse('Requête invalide', 400);
  const { notification_id } = parsed.data;

  const db = serviceRoleClient();

  const { data: notification, error: notifError } = await db
    .from('notifications')
    .select('id, user_id, title, body, deep_link')
    .eq('id', notification_id)
    .maybeSingle();
  if (notifError) return errorResponse(notifError.message, 500);
  if (!notification) return errorResponse('Notification introuvable', 404);

  const { data: tokens, error: tokensError } = await db
    .from('push_tokens')
    .select('token')
    .eq('user_id', notification.user_id);
  if (tokensError) return errorResponse(tokensError.message, 500);

  // Aucun jeton enregistré pour cet utilisateur (cas attendu dans cet environnement : la
  // capture de jeton exige un projectId EAS, absent tant qu'aucun compte EAS n'existe —
  // voir src/features/notifications/push.ts) — pas une erreur, juste rien à envoyer.
  if (!tokens || tokens.length === 0) return jsonResponse({ skipped: true, reason: 'no_push_token' });

  const messages = tokens.map((t) => ({
    to: t.token,
    title: notification.title,
    body: notification.body,
    data: { deepLink: notification.deep_link },
    sound: 'default',
  }));

  const expoResponse = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });
  const expoResult = await expoResponse.json().catch(() => null);

  return jsonResponse({ sent: messages.length, expo: expoResult }, 200);
});
