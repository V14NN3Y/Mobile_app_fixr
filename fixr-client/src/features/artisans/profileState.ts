/**
 * Résolution des 4 états du profil artisan — design/ArtisanStates.dc.html. Toujours basé
 * sur les données réelles de l'artisan/de la réservation, jamais sur son id.
 */
import { NOW } from '@/mocks/data';
import type { Artisan, Booking } from '@/types/domain';

export type ArtisanProfileState = 'alreadyBooked' | 'unavailable' | 'incomplete' | 'normal';

const ACTIVE_STATUSES: Booking['status'][] = [
  'pending',
  'quotes',
  'confirmed',
  'on_the_way',
  'on_site',
  'in_progress',
];

export function findActiveBookingForArtisan(bookings: Booking[], artisanId: string): Booking | null {
  return bookings.find((b) => b.artisanId === artisanId && ACTIVE_STATUSES.includes(b.status)) ?? null;
}

export function resolveArtisanProfileState(
  artisan: Artisan,
  activeBooking: Booking | null,
): ArtisanProfileState {
  if (activeBooking) return 'alreadyBooked';

  if (artisan.availability.unavailableUntil) {
    const until = new Date(artisan.availability.unavailableUntil);
    if (until.getTime() > new Date(NOW).getTime()) return 'unavailable';
  }

  if (artisan.yearsExperience === 0 && artisan.skills.length === 0) return 'incomplete';

  return 'normal';
}
