// delete-account — Lot 8. supabase.auth.admin.deleteUser() exige la clé service_role,
// inaccessible depuis le client : seule façon de honorer l'action « Supprimer mon compte »
// (Paramètres, Lot 7) avec un vrai effet, comme le fait déjà le reste de l'app pour toute
// action destructive (annulation de réservation, etc. — jamais un raccourci instantané côté
// client). `on delete cascade` sur profiles/addresses/favorites/… fait le reste.
import { errorResponse, getCallerId, handlePreflight, jsonResponse, serviceRoleClient } from '../_shared/client.ts';

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const callerId = await getCallerId(req);
  if (!callerId) return errorResponse('Non authentifié', 401);

  const db = serviceRoleClient();
  const { error } = await db.auth.admin.deleteUser(callerId);
  if (error) return errorResponse(error.message, 500);

  return jsonResponse({ ok: true });
});
