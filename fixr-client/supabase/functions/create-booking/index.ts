// create-booking — Lot 8. Revalide côté serveur (le zod client, features/request/schemas.ts,
// n'est qu'un confort UX) ; alloue l'id FX-xxxxx via next_booking_id() ; insère la
// réservation + ses 6 événements + ses médias. Aucune notification d'artisans réelle (pas
// d'app Artisan dans ce dépôt) — omis volontairement pour ce lot, voir le plan.
import { z } from 'npm:zod@4';

import { errorResponse, getCallerId, handlePreflight, jsonResponse, serviceRoleClient } from '../_shared/client.ts';

const mediaSchema = z.object({
  kind: z.enum(['photo', 'video']),
  storagePath: z.string().min(1),
  caption: z.string().optional(),
  durationSec: z.number().int().positive().optional(),
});

const inputSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().trim().min(5),
  description: z.string().optional(),
  media: z.array(mediaSchema).default([]),
  urgency: z.enum(['now', 'week', 'flexible']),
  artisanId: z.string().min(1).optional(),
  openSearch: z.boolean(),
  addressId: z.string().min(1),
  // Précisions propres à CETTE demande (peuvent différer de l'adresse enregistrée) —
  // reportées sur l'adresse choisie (addresses.complement/access_instructions), seul endroit
  // du schéma partagé où ces champs existent (docs/MODELE-DONNEES.md).
  addressComplement: z.string().optional(),
  addressAccessInstructions: z.string().optional(),
  slotStart: z.string().datetime({ offset: true }),
  slotEnd: z.string().datetime({ offset: true }),
  budget: z.number().int().positive().optional(),
});

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const callerId = await getCallerId(req);
  if (!callerId) return errorResponse('Non authentifié', 401);

  const parsed = inputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errorResponse('Demande incomplète', 400);
  const input = parsed.data;

  const db = serviceRoleClient();

  const { data: address, error: addressError } = await db
    .from('addresses')
    .select('id')
    .eq('id', input.addressId)
    .eq('owner_id', callerId)
    .maybeSingle();
  if (addressError) return errorResponse(addressError.message, 500);
  if (!address) return errorResponse('Adresse introuvable', 404);

  if (input.addressComplement !== undefined || input.addressAccessInstructions !== undefined) {
    await db
      .from('addresses')
      .update({
        ...(input.addressComplement !== undefined ? { complement: input.addressComplement } : {}),
        ...(input.addressAccessInstructions !== undefined
          ? { access_instructions: input.addressAccessInstructions }
          : {}),
      })
      .eq('id', input.addressId);
  }

  const { data: idRow, error: idError } = await db.rpc('next_booking_id');
  if (idError) return errorResponse(idError.message, 500);
  const bookingId = idRow as string;

  const { data: booking, error: insertError } = await db
    .from('bookings')
    .insert({
      id: bookingId,
      client_id: callerId,
      artisan_id: input.artisanId ?? null,
      category_id: input.categoryId,
      title: input.title,
      description: input.description ?? null,
      urgency: input.urgency,
      open_search: input.openSearch,
      address_id: input.addressId,
      slot_start: input.slotStart,
      slot_end: input.slotEnd,
      budget: input.budget ?? null,
      status: 'pending',
      cancellable_until: new Date(new Date(input.slotStart).getTime() - 2 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();
  if (insertError) return errorResponse(insertError.message, 500);

  await db.from('booking_events').insert([{ booking_id: bookingId, type: 'requested' }]);

  if (input.media.length > 0) {
    await db.from('booking_media').insert(
      input.media.map((m) => ({
        booking_id: bookingId,
        kind: m.kind,
        storage_path: m.storagePath,
        caption: m.caption ?? null,
        duration_sec: m.durationSec ?? null,
      })),
    );
  }

  return jsonResponse(booking, 201);
});
