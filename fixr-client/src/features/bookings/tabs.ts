/**
 * Onglets de la liste Réservations — design/Bookings.dc.html. Dérivé du statut réel de
 * chaque réservation, jamais listé à la main : le compteur par onglet est simplement
 * `.length` du tableau résultant.
 */
import type { Booking, BookingStatus } from '@/types/domain';

export type BookingTab = 'upcoming' | 'ongoing' | 'done' | 'cancelled';

export const BOOKING_TABS: BookingTab[] = ['upcoming', 'ongoing', 'done', 'cancelled'];

const TAB_FOR_STATUS: Record<BookingStatus, BookingTab> = {
  pending: 'upcoming',
  quotes: 'upcoming',
  confirmed: 'upcoming',
  on_the_way: 'ongoing',
  on_site: 'ongoing',
  in_progress: 'ongoing',
  done: 'done',
  cancelled: 'cancelled',
};

export function tabForBooking(status: BookingStatus): BookingTab {
  return TAB_FOR_STATUS[status];
}

export function bucketBookingsByTab(bookings: Booking[]): Record<BookingTab, Booking[]> {
  const buckets: Record<BookingTab, Booking[]> = { upcoming: [], ongoing: [], done: [], cancelled: [] };
  for (const booking of bookings) {
    buckets[tabForBooking(booking.status)].push(booking);
  }
  return buckets;
}
