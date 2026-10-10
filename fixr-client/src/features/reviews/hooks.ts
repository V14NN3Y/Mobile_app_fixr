import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as reviewsApi from './api';

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.submitReview,
    onSuccess: (review) => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['artisan', review.artisanId] });
      // home/api.ts trie `recommended` par note d'artisan — un nouvel avis la change.
      void queryClient.invalidateQueries({ queryKey: ['home'] });
      // Lot 7 : manquait — un avis publié n'apparaissait pas dans Mes avis sans ce correctif.
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

/** Avis publiés par l'utilisateur courant (Mes avis, Lot 7). */
export function useMyReviews() {
  return useQuery({ queryKey: ['reviews', 'mine'], queryFn: reviewsApi.getMyReviews });
}
