// accept-quote — Lot 8. Aucune UI n'appelait cette action côté mock (lecture seule des
// devis) ; ce lot ajoute le bouton « Accepter ce devis » manquant sur l'écran Détail
// réservation, qui appelle cette fonction. Vérifie que le devis appartient bien à la
// réservation et que l'appelant en est le client, passe artisan_id/status: 'confirmed',
// rejette les autres devis de la même réservation, ajoute l'événement 'confirmed'.
import { z } from 'npm:zod@4';

import { errorResponse, getCallerId, handlePreflight, jsonResponse, serviceRoleClient } from '../_shared/client.ts';

const inputSchema = z.object({
  bookingId: z.string().min(1),
  quoteId: z.string().min(1),
});

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const callerId = await getCallerId(req);
  if (!callerId) return errorResponse('Non authentifié', 401);

  const parsed = inputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse('Requête invalide', 400);
  const { bookingId, quoteId } = parsed.data;

  const db = serviceRoleClient();

  const { data: booking, error: bookingError } = await db
    .from('bookings')
    .select('id, client_id, status')
    .eq('id', bookingId)
    .maybeSingle();
  if (bookingError) return errorResponse(bookingError.message, 500);
  if (!booking || booking.client_id !== callerId) return errorResponse('Réservation introuvable', 404);
  if (booking.status !== 'quotes') return errorResponse('Cette réservation n’attend plus de devis.', 409);

  const { data: quote, error: quoteError } = await db
    .from('quotes')
    .select('id, artisan_id, booking_id')
    .eq('id', quoteId)
    .maybeSingle();
  if (quoteError) return errorResponse(quoteError.message, 500);
  if (!quote || quote.booking_id !== bookingId) return errorResponse('Devis introuvable', 404);

  const { data: updatedBooking, error: updateError } = await db
    .from('bookings')
    .update({ artisan_id: quote.artisan_id, status: 'confirmed' })
    .eq('id', bookingId)
    .select()
    .single();
  if (updateError) return errorResponse(updateError.message, 500);

  await db.from('booking_events').insert([{ booking_id: bookingId, type: 'confirmed' }]);
  await db.from('quotes').update({ status: 'accepted' }).eq('id', quoteId);
  await db.from('quotes').update({ status: 'rejected' }).eq('booking_id', bookingId).neq('id', quoteId);

  return jsonResponse(updatedBooking, 200);
});
