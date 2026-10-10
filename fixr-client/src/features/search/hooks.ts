import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAllArtisansForTrades } from '@/features/artisans/hooks';
import { useCategories } from '@/features/categories/hooks';

import * as searchApi from './api';
import { buildSuggestionPool, searchSuggestions, type SearchMode } from './suggestions';

export function usePopularSearches() {
  return useQuery({ queryKey: ['search', 'popular'], queryFn: searchApi.getPopularSearches });
}

export function useSearchSuggestions(query: string, mode: SearchMode) {
  const categoriesQuery = useCategories();
  const artisansQuery = useAllArtisansForTrades([]);

  const isLoading = categoriesQuery.isLoading || artisansQuery.isLoading;

  const suggestions = useMemo(() => {
    if (!categoriesQuery.data || !artisansQuery.data) return [];
    const pool = buildSuggestionPool(categoriesQuery.data, artisansQuery.data.items);
    return searchSuggestions(pool, query, mode);
  }, [categoriesQuery.data, artisansQuery.data, query, mode]);

  return { suggestions, isLoading };
}
