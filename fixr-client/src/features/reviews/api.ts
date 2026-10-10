import { ApiError, simulateRequest } from '@/mocks/api';
import { artisans, bookings, reviews, user } from '@/mocks/data';
import type { Review } from '@/types/domain';

import { nextAverageRating, nextRatingDistribution } from './ratingMath';

export type SubmitReviewInput = {
  bookingId: string;
  artisanId: string;
  authorName: string;
  rating: number;
  criteria?: Review['criteria'];
  text?: string;
  service: string;
};

/**
 * Publie un avis : pousse dans `reviews`, met à jour l'artisan (rating/reviewCount/
 * ratingDistribution) et marque la réservation comme notée — toute la mutation dans une
 * seule fonction, comme `createBooking` au Lot 4 (couche features/*, jamais un écran).
 */
export async function submitReview(input: SubmitReviewInput): Promise<Review> {
  return simulateRequest(() => {
    const booking = bookings.find((b) => b.id === input.bookingId);
    if (!booking) throw new ApiError('Réservation introuvable', 404);
    const artisan = artisans.find((a) => a.id === input.artisanId);
    if (!artisan) throw new ApiError('Artisan introuvable', 404);

    const review: Review = {
      id: `rv${Date.now()}`,
      artisanId: input.artisanId,
      bookingId: input.bookingId,
      authorId: user.id, // Lot 7 : relie l'avis à l'utilisateur courant (Mes avis)
      authorName: input.authorName,
      rating: input.rating,
      criteria: input.criteria,
      text: input.text,
      service: input.service,
      createdAt: new Date().toISOString(),
    };
    reviews.push(review);

    artisan.ratingDistribution = nextRatingDistribution(
      artisan.ratingDistribution,
      artisan.reviewCount,
      input.rating,
    );
    artisan.rating = nextAverageRating(artisan.rating, artisan.reviewCount, input.rating);
    artisan.reviewCount += 1;

    booking.reviewed = true;

    return review;
  });
}

/** Avis publiés par l'utilisateur courant (Mes avis, Lot 7). */
export async function getMyReviews(): Promise<Review[]> {
  return simulateRequest(() => reviews.filter((r) => r.authorId === user.id));
}
