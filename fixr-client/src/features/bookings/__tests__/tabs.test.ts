import { bookings } from '@/mocks/data';

import { bucketBookingsByTab, tabForBooking } from '../tabs';

describe('tabForBooking', () => {
  it.each([
    ['pending', 'upcoming'],
    ['quotes', 'upcoming'],
    ['confirmed', 'upcoming'],
    ['on_the_way', 'ongoing'],
    ['on_site', 'ongoing'],
    ['in_progress', 'ongoing'],
    ['done', 'done'],
    ['cancelled', 'cancelled'],
  ] as const)('%s → %s', (status, tab) => {
    expect(tabForBooking(status)).toBe(tab);
  });
});

describe('bucketBookingsByTab', () => {
  it('répartit les réservations mock réelles dans les 4 onglets', () => {
    const buckets = bucketBookingsByTab(bookings);
    expect(buckets.upcoming.map((b) => b.id)).toEqual(expect.arrayContaining(['FX-25103', 'FX-24990', 'FX-24951']));
    expect(buckets.ongoing.map((b) => b.id)).toEqual(['FX-24817']);
    expect(buckets.done.map((b) => b.id)).toEqual(expect.arrayContaining(['FX-24402', 'FX-23877']));
    expect(buckets.cancelled.map((b) => b.id)).toEqual(['FX-23790']);
  });

  it('le total des 4 compartiments égale le nombre de réservations', () => {
    const buckets = bucketBookingsByTab(bookings);
    const total = buckets.upcoming.length + buckets.ongoing.length + buckets.done.length + buckets.cancelled.length;
    expect(total).toBe(bookings.length);
  });
});
