import { getBookings } from '@/features/bookings/api';

import { createBooking } from '../api';
import { createDefaultDraft } from '../store';

describe('createBooking (plomberie « À venir »)', () => {
  it('mute le tableau partagé : la réservation créée apparaît dans getBookings()', async () => {
    const draft = {
      ...createDefaultDraft(),
      categoryId: 'plomberie' as const,
      title: 'Fuite testée',
      addressId: 'a_maison',
      dayOffset: 2,
      slotIndex: 3,
    };

    const booking = await createBooking(draft);
    const all = await getBookings();

    expect(all[0]!.id).toBe(booking.id);
    expect(all.some((b) => b.id === booking.id)).toBe(true);
  }, 10000);
});
