/**
 * Favoris — préférence client persistée (MMKV). En mode mock : source de vérité unique,
 * amorcée depuis mocks/data.favoriteArtisanIds, comme avant le Lot 8 (CLAUDE.md : « zustand :
 * état client, préférences »). En mode réel (Lot 8) : cache local optimiste, synchronisé au
 * démarrage par setFavoriteIds() (appelé par useSyncFavorites(), monté une fois dans
 * app/_layout.tsx) ; toggleFavorite reste synchrone pour les 4 écrans qui l'utilisent déjà
 * (pas de réécriture en useMutation), mais répercute l'appel réseau en arrière-plan — en cas
 * d'échec, l'état local revient en arrière (pas de toast ici : aucun store de ce projet n'a
 * accès au contexte Toast, cohérent avec search/filters/settings).
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { USE_MOCKS } from '@/lib/env';
import { mmkvStorage } from '@/lib/storage';
import { favoriteArtisanIds } from '@/mocks/data';

import { addFavorite, removeFavorite } from './api';

type FavoritesState = {
  favoriteIds: string[];
  isFavorite: (artisanId: string) => boolean;
  toggleFavorite: (artisanId: string) => void;
  setFavoriteIds: (ids: string[]) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: USE_MOCKS ? favoriteArtisanIds : [],
      isFavorite: (artisanId) => get().favoriteIds.includes(artisanId),
      toggleFavorite: (artisanId) => {
        const wasFavorite = get().favoriteIds.includes(artisanId);
        set((state) => ({
          favoriteIds: wasFavorite
            ? state.favoriteIds.filter((id) => id !== artisanId)
            : [...state.favoriteIds, artisanId],
        }));
        if (USE_MOCKS) return;
        const request = wasFavorite ? removeFavorite(artisanId) : addFavorite(artisanId);
        request.catch(() => {
          // Échec réseau : on annule l'optimisme local (retour à l'état d'avant le tap).
          set((state) => ({
            favoriteIds: wasFavorite
              ? [...state.favoriteIds, artisanId]
              : state.favoriteIds.filter((id) => id !== artisanId),
          }));
        });
      },
      setFavoriteIds: (ids) => set({ favoriteIds: ids }),
    }),
    {
      name: 'fixr-favorites',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
