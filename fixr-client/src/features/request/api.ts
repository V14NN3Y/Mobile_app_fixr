import { ApiError, simulateRequest } from '@/mocks/api';
import { bookings, NOW } from '@/mocks/data';
import type { Booking } from '@/types/domain';

import { buildBooking } from './buildBooking';
import { fullRequestSchema } from './schemas';
import type { RequestDraft } from './store';

export async function createBooking(draft: RequestDraft): Promise<Booking> {
  return simulateRequest(() => {
    const parsed = fullRequestSchema.safeParse(draft);
    if (!parsed.success) throw new ApiError('Demande incomplète', 400);

    const booking = buildBooking(draft, bookings, new Date(NOW));

    // Mutation directe du tableau mock partagé (couche features/*, jamais depuis un écran) :
    // c'est ce qui permet au Lot 5 de voir la nouvelle réservation sans rien changer ici.
    bookings.unshift(booking);
    return booking;
  });
}
