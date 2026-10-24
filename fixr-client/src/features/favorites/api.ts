/**
 * Favoris (Lot 8) — contrairement aux 13 autres domaines, pas de bascule mock/api.supabase
 * à 2 implémentations : en mode mock, src/features/favorites/store.ts reste 100 % autonome
 * (amorcé depuis mocks/data.favoriteArtisanIds, comme avant le Lot 8) — ce fichier n'est
 * appelé qu'en mode réel (voir store.ts : tous les appels sont gardés par `!USE_MOCKS`).
 */
import { ApiError } from '@/lib/apiError';
import { requireUserId, supabase } from '@/lib/supabase';

export async function getFavoriteArtisanIds(): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('artisan_id');
  if (error) throw new ApiError(error.message);
  return data.map((row) => row.artisan_id);
}

export async function addFavorite(artisanId: string): Promise<void> {
  const userId = await requireUserId();
  const { error } = await supabase.from('favorites').insert({ user_id: userId, artisan_id: artisanId });
  if (error) throw new ApiError(error.message);
}

export async function removeFavorite(artisanId: string): Promise<void> {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('artisan_id', artisanId);
  if (error) throw new ApiError(error.message);
}
