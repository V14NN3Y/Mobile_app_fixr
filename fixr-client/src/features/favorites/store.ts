/**
 * Favoris — préférence client persistée (MMKV), pas de React Query : avant Supabase
 * (Lot 8), c'est un choix local de l'utilisateur, pas une donnée serveur (CLAUDE.md :
 * « zustand : état client, préférences »). Amorcé depuis mocks/data.favoriteArtisanIds.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/lib/storage';
import { favoriteArtisanIds } from '@/mocks/data';

type FavoritesState = {
  favoriteIds: string[];
  isFavorite: (artisanId: string) => boolean;
  toggleFavorite: (artisanId: string) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: favoriteArtisanIds,
      isFavorite: (artisanId) => get().favoriteIds.includes(artisanId),
      toggleFavorite: (artisanId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(artisanId)
            ? state.favoriteIds.filter((id) => id !== artisanId)
            : [...state.favoriteIds, artisanId],
        })),
    }),
    {
      name: 'fixr-favorites',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
