// simulate-artisan-reply — Lot 8 (même raisonnement qu'advance-mission-stage : pas d'app
// Artisan dans ce dépôt). Le Chat (app/(tabs)/messages/[threadId].tsx) simule depuis le Lot 6
// une réponse automatique de l'artisan après un délai, pour que la démo reste vivante — cette
// insertion ne peut plus se faire directement depuis le client en mode réel (RLS exige
// sender_id = auth.uid(), un client ne peut jamais écrire un message au nom de l'artisan).
// Reste une Edge Function étroite plutôt qu'un assouplissement de la policy : seule la
// fonction, jamais le client, peut usurper l'expéditeur.
import { z } from 'npm:zod@4';

import { errorResponse, getCallerId, handlePreflight, jsonResponse, serviceRoleClient } from '../_shared/client.ts';

const inputSchema = z.object({ conversationId: z.string().min(1), text: z.string().min(1) });

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const callerId = await getCallerId(req);
  if (!callerId) return errorResponse('Non authentifié', 401);

  const parsed = inputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse('Requête invalide', 400);
  const { conversationId, text } = parsed.data;

  const db = serviceRoleClient();

  const { data: conversation, error: convError } = await db
    .from('conversations')
    .select('id, client_id, artisan_id')
    .eq('id', conversationId)
    .maybeSingle();
  if (convError) return errorResponse(convError.message, 500);
  if (!conversation || conversation.client_id !== callerId) {
    return errorResponse('Conversation introuvable', 404);
  }

  const { data, error } = await db
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: conversation.artisan_id,
      kind: 'text',
      body: text,
      delivered_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) return errorResponse(error.message, 500);

  return jsonResponse(data, 201);
});
