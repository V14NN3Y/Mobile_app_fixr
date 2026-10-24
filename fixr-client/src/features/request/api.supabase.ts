import { getBookingById } from '@/features/bookings/api.supabase';
import { ApiError } from '@/lib/apiError';
import { requireUserId, supabase } from '@/lib/supabase';
import { timeSlots } from '@/mocks/data';
import type { Booking } from '@/types/domain';

import { addDays, combineDateTime } from './buildBooking';
import { fullRequestSchema } from './schemas';
import type { RequestDraft } from './store';

/**
 * Revalide côté client (confort UX, comme avant) puis délègue la création à la Edge
 * Function create-booking (allocation d'id par séquence, insertion atomique — voir
 * supabase/functions/create-booking). Les médias locaux (RequestMedia.uri, un chemin de
 * fichier device) sont d'abord envoyés au bucket request-media ; la fonction ne reçoit que
 * leurs chemins de stockage.
 */
export async function createBooking(draft: RequestDraft): Promise<Booking> {
  const parsed = fullRequestSchema.safeParse(draft);
  if (!parsed.success) throw new ApiError('Demande incomplète', 400);

  const userId = await requireUserId();
  const slot = timeSlots[draft.slotIndex!]!;
  const slotDate = addDays(new Date(), draft.dayOffset!);
  const slotStart = combineDateTime(slotDate, slot.start);
  const slotEnd = combineDateTime(slotDate, slot.end);

  const media = await Promise.all(
    draft.media.map(async (m) => {
      const ext = m.kind === 'video' ? 'mp4' : 'jpg';
      const path = `${userId}/${m.id}.${ext}`;
      const response = await fetch(m.uri);
      const blob = await response.blob();
      const { error } = await supabase.storage.from('request-media').upload(path, blob, { upsert: true });
      if (error) throw new ApiError(error.message);
      return { kind: m.kind, storagePath: path, durationSec: m.durationSec };
    }),
  );

  const { data, error } = await supabase.functions.invoke<{ id: string }>('create-booking', {
    body: {
      categoryId: draft.categoryId,
      title: draft.title.trim(),
      description: draft.description.trim() || undefined,
      media,
      urgency: draft.urgency,
      artisanId: draft.artisanId,
      openSearch: draft.openSearch,
      addressId: draft.addressId,
      addressComplement: draft.addressComplement || undefined,
      addressAccessInstructions: draft.addressAccessInstructions || undefined,
      slotStart,
      slotEnd,
      budget: draft.budget,
    },
  });
  if (error) throw new ApiError(error.message);

  // La fonction renvoie la ligne brute insérée ; on relit via le mapper existant pour
  // obtenir la forme Booking complète (media[]/events[]…) attendue par l'UI.
  return getBookingById(data!.id);
}
