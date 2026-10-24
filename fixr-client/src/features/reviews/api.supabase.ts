import { ApiError } from '@/lib/apiError';
import { requireUserId, supabase } from '@/lib/supabase';
import type { Review } from '@/types/domain';

import type { SubmitReviewInput } from './api.mock';

type Row = {
  id: string;
  artisan_id: string;
  booking_id: string | null;
  author_id: string | null;
  rating: number;
  punctuality: number | null;
  quality: number | null;
  communication: number | null;
  value: number | null;
  text: string | null;
  service: string;
  created_at: string;
  profiles: { first_name: string; last_name: string } | null;
};

const SELECT =
  'id, artisan_id, booking_id, author_id, rating, punctuality, quality, communication, value, text, service, created_at, profiles(first_name, last_name)';

function toReview(row: Row): Review {
  const hasCriteria =
    row.punctuality !== null || row.quality !== null || row.communication !== null || row.value !== null;
  return {
    id: row.id,
    artisanId: row.artisan_id,
    bookingId: row.booking_id ?? undefined,
    authorId: row.author_id ?? undefined,
    // src/mocks/data.ts stockait authorName en texte libre ; le schéma partagé le dérive de
    // profiles via author_id (voir supabase/seed.sql pour les 2 "comptes fantômes" créés
    // pour les avis historiques sans vrai auteur).
    authorName: row.profiles ? `${row.profiles.first_name} ${row.profiles.last_name.charAt(0)}.` : 'Client FIXR',
    rating: row.rating,
    criteria: hasCriteria
      ? {
          punctuality: row.punctuality ?? undefined,
          quality: row.quality ?? undefined,
          communication: row.communication ?? undefined,
          value: row.value ?? undefined,
        }
      : undefined,
    text: row.text ?? undefined,
    service: row.service,
    createdAt: row.created_at,
  };
}

/**
 * Publie un avis. La mise à jour de artisans.rating/review_count se fait désormais côté
 * serveur (trigger reviews_update_artisan_rating, migration functions_triggers) — plus de
 * read-then-write client. booking.reviewed n'est pas une colonne stockée : elle se dérive
 * de l'existence d'un avis pour ce booking_id (reviews.booking_id unique).
 */
export async function submitReview(input: SubmitReviewInput): Promise<Review> {
  const authorId = await requireUserId();
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      booking_id: input.bookingId,
      artisan_id: input.artisanId,
      author_id: authorId,
      rating: input.rating,
      punctuality: input.criteria?.punctuality ?? null,
      quality: input.criteria?.quality ?? null,
      communication: input.criteria?.communication ?? null,
      value: input.criteria?.value ?? null,
      text: input.text ?? null,
      service: input.service,
      // status omis : reste sur le défaut 'pending_moderation' de la colonne (voir le
      // policy RLS reviews_insert_own_done_booking, qui l'exige explicitement).
    })
    .select(SELECT)
    .single();
  if (error) throw new ApiError(error.message);
  // Voir le commentaire équivalent dans features/artisans/api.supabase.ts : relation 1-1
  // (profiles via author_id) inférée en tableau sans types générés, objet unique à l'exécution.
  return toReview(data as unknown as Row);
}

export async function getMyReviews(): Promise<Review[]> {
  const authorId = await requireUserId();
  const { data, error } = await supabase
    .from('reviews')
    .select(SELECT)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });
  if (error) throw new ApiError(error.message);
  return (data as unknown as Row[]).map(toReview);
}
