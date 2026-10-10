import { artisans, bookings } from '@/mocks/data';

import { findActiveBookingForArtisan, resolveArtisanProfileState } from '../profileState';

const koffi = artisans.find((a) => a.id === 'ar_koffi')!;
const rachidi = artisans.find((a) => a.id === 'ar_rachidi')!;
const bernard = artisans.find((a) => a.id === 'ar_bernard')!;

describe('resolveArtisanProfileState', () => {
  it('Koffi (profil complet) → normal, sans réservation active', () => {
    expect(resolveArtisanProfileState(koffi, null)).toBe('normal');
  });

  it('Koffi a une réservation active dans mocks/data.ts (FX-24817, on_the_way) → alreadyBooked', () => {
    // Note : au 2026-09-28 (horloge simulée), visiter /artisan/ar_koffi montre donc cet état,
    // pas le profil complet normal — comportement voulu (design/ArtisanStates.dc.html col. 3
    // réutilise justement Koffi pour ce cas), pas une régression.
    const active = findActiveBookingForArtisan(bookings, 'ar_koffi');
    expect(active?.id).toBe('FX-24817');
    expect(resolveArtisanProfileState(koffi, active)).toBe('alreadyBooked');
  });

  it('Rachidi (profil incomplet) → incomplete', () => {
    expect(resolveArtisanProfileState(rachidi, null)).toBe('incomplete');
  });

  it('Bernard (unavailableUntil futur) → unavailable', () => {
    expect(resolveArtisanProfileState(bernard, null)).toBe('unavailable');
  });
});
