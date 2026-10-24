// advance-mission-stage — Lot 8 (décision validée : pas d'app Artisan dans ce dépôt).
// Remplace l'ancien advanceMissionStage() client (mutation directe sur le statut) : l'écran
// Mission en direct (app/(tabs)/bookings/[id]/live.tsx) garde son minuteur de 5 s, mais
// appelle désormais CETTE fonction, qui revalide la transition et écrit en base — respecte
// la règle RLS « jamais d'update direct » tout en préservant la démo et le parcours Maestro
// tracking-review.yaml. Insère aussi une notification, pour donner un contenu réel au centre
// de notifications Realtime sans artisan qui en enverrait une.
import { z } from 'npm:zod@4';

import { errorResponse, getCallerId, handlePreflight, jsonResponse, serviceRoleClient } from '../_shared/client.ts';

// Même table que src/features/bookings/missionStage.ts — à garder synchronisée si elle change.
const TRANSITIONS: Record<string, { next: string; event: string } | undefined> = {
  on_the_way: { next: 'on_site', event: 'on_site' },
  on_site: { next: 'in_progress', event: 'in_progress' },
  in_progress: { next: 'done', event: 'done' },
};

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
    .select('id, client_id, artisan_id, status, title')
    .eq('id', bookingId)
    .maybeSingle();
  if (bookingError) return errorResponse(bookingError.message, 500);
  if (!booking || booking.client_id !== callerId) return errorResponse('Réservation introuvable', 404);

  const transition = TRANSITIONS[booking.status];
  if (!transition) {
    // Pas d'erreur : le minuteur client continue d'appeler toutes les 5 s même une fois
    // 'done' atteint, jusqu'à son propre démontage — no-op silencieux, comme le mock.
    return jsonResponse(booking, 200);
  }

  const { data: updated, error: updateError } = await db
    .from('bookings')
    .update({ status: transition.next })
    .eq('id', bookingId)
    .select()
    .single();
  if (updateError) return errorResponse(updateError.message, 500);

  await db.from('booking_events').insert([{ booking_id: bookingId, type: transition.event }]);

  let artisanFirstName = "l'artisan";
  if (booking.artisan_id) {
    const { data: artisanProfile } = await db
      .from('profiles')
      .select('first_name')
      .eq('id', booking.artisan_id)
      .maybeSingle();
    if (artisanProfile) artisanFirstName = artisanProfile.first_name;
  }

  // Pas de type de notification dédié "arrivé"/"en cours" dans NotificationType
  // (src/types/domain.ts) : 'booking_changed' couvre ces 2 transitions intermédiaires,
  // 'report_ready' la transition finale (un rapport existe déjà pour les réservations
  // de ce lot — voir supabase/seed.sql).
  const notification =
    transition.event === 'on_site'
      ? {
          type: 'booking_changed',
          title: `${artisanFirstName} est arrivé`,
          body: `${artisanFirstName} est arrivé pour « ${booking.title} ».`,
          deep_link: `fixr://bookings/${bookingId}/live`,
        }
      : transition.event === 'in_progress'
        ? {
            type: 'booking_changed',
            title: 'Intervention en cours',
            body: `${artisanFirstName} a commencé l'intervention pour « ${booking.title} ».`,
            deep_link: `fixr://bookings/${bookingId}/live`,
          }
        : {
            type: 'report_ready',
            title: "Le rapport d'intervention est disponible",
            body: `${booking.title} · ${artisanFirstName}`,
            cta: 'Consulter',
            deep_link: `fixr://bookings/${bookingId}/report`,
          };

  await db.from('notifications').insert([{ user_id: callerId, ...notification }]);

  return jsonResponse(updated, 200);
});
