import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { NOW } from '@/mocks/data';

import * as artisansApi from './api';
import { countArtisans } from './filtering';
import type { ArtisanFilters, ArtisanSort } from './types';

const PAGE_SIZE = 6;

export function useArtisans(filters: ArtisanFilters, sort: ArtisanSort) {
  return useInfiniteQuery({
    queryKey: ['artisans', 'search', filters, sort],
    queryFn: ({ pageParam }) =>
      artisansApi.searchArtisans({ filters, sort, page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
  });
}

/** Liste complète filtrée/triée (non paginée) — pour les marqueurs de la vue carte. */
export function useArtisansForMap(filters: ArtisanFilters, sort: ArtisanSort) {
  return useQuery({
    queryKey: ['artisans', 'map', filters, sort],
    queryFn: () => artisansApi.searchArtisans({ filters, sort, page: 0, pageSize: 200 }),
  });
}

/** Liste complète (non paginée) — base du compteur en direct de l'écran Filtres. */
export function useAllArtisansForTrades(trades: ArtisanFilters['trades']) {
  return useQuery({
    queryKey: ['artisans', 'all', trades],
    queryFn: () =>
      artisansApi.searchArtisans({
        filters: { trades, includeOnQuote: true, verificationLevels: [] },
        sort: 'relevance',
        page: 0,
        pageSize: 1000,
      }),
  });
}

/** Compteur « Afficher N artisans » en direct (écran Filtres) — mêmes règles que les Résultats. */
export function useArtisanCount(filters: ArtisanFilters) {
  const allQuery = useAllArtisansForTrades(filters.trades);
  const count = useMemo(
    () => (allQuery.data ? countArtisans(allQuery.data.items, filters, new Date(NOW)) : undefined),
    [allQuery.data, filters],
  );
  return { count, isLoading: allQuery.isLoading };
}

export function useArtisan(id: string, enabled = true) {
  return useQuery({
    queryKey: ['artisan', id],
    queryFn: () => artisansApi.getArtisan(id),
    enabled,
  });
}

export function useArtisanAlternatives(excludeId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['artisan', excludeId, 'alternatives'],
    queryFn: () => artisansApi.getArtisanAlternatives(excludeId),
    enabled,
  });
}
