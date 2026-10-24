import { ApiError } from '@/lib/apiError';
import { requireUserId, supabase } from '@/lib/supabase';
import type { User } from '@/types/domain';

export async function getCurrentUser(): Promise<User> {
  const userId = await requireUserId();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, email, avatar_url, created_at')
    .eq('id', userId)
    .single();
  if (profileError) throw new ApiError(profileError.message);

  // `head: true` (compte seul, sans lignes) provoque un net::ERR_ABORTED systématique dans
  // Chromium derrière le proxy Kong local (réponse HEAD sans Content-Length — curl s'en
  // accommode, pas fetch()) : constaté en testant l'app réelle dans un vrai navigateur,
  // jamais vu via curl pendant le développement. Lignes récupérées pour de vrai à la place
  // (volume négligeable à cette échelle) ; seul .count est utilisé.
  const [bookings, favorites, reviews] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact' }).eq('client_id', userId),
    supabase.from('favorites').select('artisan_id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('reviews').select('id', { count: 'exact' }).eq('author_id', userId),
  ]);
  if (bookings.error) throw new ApiError(bookings.error.message);
  if (favorites.error) throw new ApiError(favorites.error.message);
  if (reviews.error) throw new ApiError(reviews.error.message);

  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    phone: profile.phone,
    // Toujours vrai ici : la seule façon d'avoir une session dans cette app est d'avoir
    // réussi une vérification OTP par téléphone (voir features/auth/api.supabase.ts) —
    // auth.users.phone_confirmed_at n'est de toute façon pas exposé par l'API publique.
    phoneVerified: true,
    email: profile.email ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
    memberSince: profile.created_at,
    stats: {
      missions: bookings.count ?? 0,
      favorites: favorites.count ?? 0,
      reviews: reviews.count ?? 0,
    },
  };
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account');
  if (error) throw new ApiError(error.message);
}
