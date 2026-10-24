import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { USE_MOCKS } from '@/lib/env';

import { getFavoriteArtisanIds } from './api';
import { useFavoritesStore } from './store';

/**
 * Hydrate le store favoris depuis le serveur au démarrage (mode réel uniquement) — monté
 * une fois dans app/_layout.tsx. En mode mock, le store s'amorce déjà seul (voir store.ts).
 */
export function useSyncFavorites(): void {
  const setFavoriteIds = useFavoritesStore((s) => s.setFavoriteIds);
  const query = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoriteArtisanIds,
    enabled: !USE_MOCKS,
  });

  useEffect(() => {
    if (query.data) setFavoriteIds(query.data);
  }, [query.data, setFavoriteIds]);
}
