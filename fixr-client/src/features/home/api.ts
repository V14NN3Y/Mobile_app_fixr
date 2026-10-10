import { applySort } from '@/features/artisans/filtering';
import { simulateRequest } from '@/mocks/api';
import { artisans, bookings, categories } from '@/mocks/data';
import type { Artisan, Booking, Category } from '@/types/domain';

const ACTIVE_STATUSES: Booking['status'][] = ['on_the_way', 'on_site', 'in_progress'];

export type ActiveMission = { booking: Booking; artisan: Artisan; category: Category };
export type LastBooking = { booking: Booking; artisan: Artisan | null };

export type HomeData = {
  activeMission: ActiveMission | null;
  lastBooking: LastBooking | null;
  recommended: Artisan[];
  nearbyNow: Artisan[];
};

export async function getHomeData(): Promise<HomeData> {
  return simulateRequest(() => {
    const activeBooking = bookings.find((b) => ACTIVE_STATUSES.includes(b.status)) ?? null;
    const activeMission: ActiveMission | null = activeBooking
      ? {
          booking: activeBooking,
          artisan: artisans.find((a) => a.id === activeBooking.artisanId)!,
          category: categories.find((c) => c.id === activeBooking.categoryId)!,
        }
      : null;

    const doneBookings = bookings
      .filter((b) => b.status === 'done')
      .sort((a, b) => b.slotStart.localeCompare(a.slotStart));
    const lastBookingEntry = doneBookings[0] ?? null;
    const lastBooking: LastBooking | null = lastBookingEntry
      ? {
          booking: lastBookingEntry,
          artisan: artisans.find((a) => a.id === lastBookingEntry.artisanId) ?? null,
        }
      : null;

    const recommended = applySort(artisans, 'rating').slice(0, 3);
    const nearbyNow = applySort(
      artisans.filter((a) => a.online && a.availability.today),
      'distance',
    ).slice(0, 2);

    return { activeMission, lastBooking, recommended, nearbyNow };
  });
}
