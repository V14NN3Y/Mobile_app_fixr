import { applySort } from '@/features/artisans/filtering';
import { searchArtisans } from '@/features/artisans/api.supabase';
import { getBookings } from '@/features/bookings/api.supabase';
import { getCategories } from '@/features/categories/api.supabase';
import type { Booking } from '@/types/domain';

import type { ActiveMission, HomeData, LastBooking } from './api.mock';

const ACTIVE_STATUSES: Booking['status'][] = ['on_the_way', 'on_site', 'in_progress'];

/** Même agrégation que le mock (api.mock.ts), mais sur des données réelles — toujours une
 * simple composition de lectures côté client, pas une Edge Function (aucune transition de
 * statut ici, juste un assemblage). */
export async function getHomeData(): Promise<HomeData> {
  const [bookings, artisansPage, categories] = await Promise.all([
    getBookings(),
    searchArtisans({
      filters: { trades: [], includeOnQuote: true, verificationLevels: [] },
      sort: 'relevance',
      page: 0,
      pageSize: 1000,
    }),
    getCategories(),
  ]);
  const artisans = artisansPage.items;

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
}
