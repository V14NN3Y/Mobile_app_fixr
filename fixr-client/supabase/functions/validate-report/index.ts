// validate-report — Lot 8. Câblée sur le bouton « Confirmer la fin de l'intervention »
// (app/(tabs)/bookings/[id]/report.tsx), qui jusqu'ici n'était qu'une navigation sans effet
// serveur. Passe reports.status de 'awaiting_validation' à 'validated'.
import { z } from 'npm:zod@4';

import { errorResponse, getCallerId, handlePreflight, jsonResponse, serviceRoleClient } from '../_shared/client.ts';

const inputSchema = z.object({ bookingId: z.string().min(1) });

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const callerId = await getCallerId(req);
  if (!callerId) return errorResponse('Non authentifié', 401);

  const parsed = inputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse('Requête invalide', 400);
  const { bookingId } = parsed.data;

  const db = serviceRoleClient();

  const { data: booking, error: bookingError } = await db
    .from('bookings')
    .select('id, client_id')
    .eq('id', bookingId)
    .maybeSingle();
  if (bookingError) return errorResponse(bookingError.message, 500);
  if (!booking || booking.client_id !== callerId) return errorResponse('Réservation introuvable', 404);

  const { data: report, error: reportError } = await db
    .from('reports')
    .select('booking_id, status')
    .eq('booking_id', bookingId)
    .maybeSingle();
  if (reportError) return errorResponse(reportError.message, 500);
  if (!report) return errorResponse('Rapport introuvable', 404);
  if (report.status !== 'awaiting_validation') {
    return errorResponse('Ce rapport a déjà été traité.', 409);
  }

  const { data: updated, error: updateError } = await db
    .from('reports')
    .update({ status: 'validated' })
    .eq('booking_id', bookingId)
    .select()
    .single();
  if (updateError) return errorResponse(updateError.message, 500);

  return jsonResponse(updated, 200);
});
