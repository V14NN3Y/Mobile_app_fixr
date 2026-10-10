import { getArtisan } from '@/features/artisans/api';
import { getBookingById } from '@/features/bookings/api';
import { artisans, reviews, user } from '@/mocks/data';

import { getMyReviews, submitReview } from '../api';

describe('submitReview (critère 3 : la note publiée met à jour le profil artisan en local)', () => {
  it('met à jour rating/reviewCount/ratingDistribution de ar_koffi et marque FX-24817 noté', async () => {
    const before = await getArtisan('ar_koffi');
    const ratingBefore = before.rating;
    const countBefore = before.reviewCount;
    const reviewsCountBefore = reviews.length;

    const review = await submitReview({
      bookingId: 'FX-24817',
      artisanId: 'ar_koffi',
      authorName: 'Aurore T.',
      rating: 5,
      service: 'Fuite sous l’évier',
    });

    expect(review.bookingId).toBe('FX-24817');
    expect(review.authorId).toBe(user.id);
    expect(reviews.length).toBe(reviewsCountBefore + 1);
    expect(reviews[reviews.length - 1]).toBe(review);

    const after = await getArtisan('ar_koffi');
    expect(after.reviewCount).toBe(countBefore + 1);
    expect(after.rating).toBeCloseTo((ratingBefore * countBefore + 5) / (countBefore + 1), 1);

    const booking = await getBookingById('FX-24817');
    expect(booking.reviewed).toBe(true);
  }, 10000);

  it('un artisan sans ratingDistribution garde ratingDistribution undefined après un avis', async () => {
    const target = artisans.find((a) => !a.ratingDistribution);
    expect(target).toBeDefined();

    await submitReview({
      bookingId: 'FX-24951',
      artisanId: target!.id,
      authorName: 'Test',
      rating: 4,
      service: 'Test',
    });

    const after = await getArtisan(target!.id);
    expect(after.ratingDistribution).toBeUndefined();
  }, 10000);
});

describe('getMyReviews (Mes avis, Lot 7)', () => {
  it('ne renvoie que les avis dont authorId correspond à l’utilisateur courant', async () => {
    const mine = await getMyReviews();
    expect(mine.length).toBeGreaterThanOrEqual(4); // rv3-rv6 des fixtures
    expect(mine.every((r) => r.authorId === user.id)).toBe(true);
    expect(mine.some((r) => r.id === 'rv1')).toBe(false); // rv1/rv2 n'ont pas d'authorId
  }, 10000);

  it('inclut un avis fraîchement publié via submitReview', async () => {
    const before = await getMyReviews();
    await submitReview({
      bookingId: 'FX-24990',
      artisanId: 'ar_christelle',
      authorName: 'Aurore T.',
      rating: 5,
      service: 'Peinture chambre',
    });
    const after = await getMyReviews();
    expect(after.length).toBe(before.length + 1);
  }, 15000);
});
