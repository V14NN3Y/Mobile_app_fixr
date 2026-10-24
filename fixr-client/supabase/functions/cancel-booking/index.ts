// cancel-booking — Lot 8. Donne enfin un sens à CANCELLATION_FEE_FCFA (jusqu'ici un montant
// fixe côté mock, jamais comparé à une échéance) : frais réels seulement si l'annulation a
// lieu après cancellable_until. Refuse d'annuler une réservation déjà done/cancelled.
import { z } from 'npm:zod@4';

import { errorResponse, getCallerId, handlePreflight, jsonResponse, serviceRoleClient } from '../_shared/client.ts';

// Même montant que src/features/bookings/constants.ts (CANCELLATION_FEE_FCFA) — gardé en
// miroir ici plutôt qu'en base, puisque c'est un paramètre produit, pas une donnée.
const CANCELLATION_FEE_FCFA = 2000;

const inputSchema = z.object({
  bookingId: z.string().min(1),
  reason: z.enum(['resolved', 'dateChanged', 'tooExpensive', 'other']).optional(),
});

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const callerId = await getCallerId(req);
  if (!callerId) return errorResponse('Non authentifié', 401);

  const parsed = inputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse('Requête invalide', 400);
  const { bookingId, reason } = parsed.data;

  const db = serviceRoleClient();

  const { data: booking, error: bookingError } = await db
    .from('bookings')
    .select('id, client_id, status, cancellable_until')
    .eq('id', bookingId)
    .maybeSingle();
  if (bookingError) return errorResponse(bookingError.message, 500);
  if (!booking || booking.client_id !== callerId) return errorResponse('Réservation introuvable', 404);
  if (booking.status === 'done' || booking.status === 'cancelled') {
    return errorResponse('Cette réservation ne peut plus être annulée.', 409);
  }

  const now = new Date();
  const pastDeadline = booking.cancellable_until ? now > new Date(booking.cancellable_until) : false;
  const fee = pastDeadline ? CANCELLATION_FEE_FCFA : 0;

  const { data: updated, error: updateError } = await db
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_by: 'client',
      cancel_reason: reason ?? null,
      cancellation_fee: fee,
    })
    .eq('id', bookingId)
    .select()
    .single();
  if (updateError) return errorResponse(updateError.message, 500);

  await db.from('booking_events').insert([{ booking_id: bookingId, type: 'cancelled' }]);

  return jsonResponse(updated, 200);
});
