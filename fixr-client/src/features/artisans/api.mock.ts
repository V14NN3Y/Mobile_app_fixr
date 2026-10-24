import { ApiError, simulateRequest } from '@/mocks/api';
import { artisans, NOW } from '@/mocks/data';
import type { Artisan } from '@/types/domain';

import { applyFilters, applySort } from './filtering';
import type { ArtisanFilters, ArtisanSort } from './types';

export type ArtisansPage = {
  items: Artisan[];
  page: number;
  total: number;
  hasNextPage: boolean;
};

export type SearchArtisansInput = {
  filters: ArtisanFilters;
  sort: ArtisanSort;
  page: number;
  pageSize: number;
};

export async function searchArtisans({
  filters,
  sort,
  page,
  pageSize,
}: SearchArtisansInput): Promise<ArtisansPage> {
  return simulateRequest(() => {
    const matched = applySort(applyFilters(artisans, filters, new Date(NOW)), sort);
    const start = page * pageSize;
    const items = matched.slice(start, start + pageSize);
    return { items, page, total: matched.length, hasNextPage: start + pageSize < matched.length };
  });
}

export async function getArtisan(id: string): Promise<Artisan> {
  return simulateRequest(() => {
    const artisan = artisans.find((a) => a.id === id);
    if (!artisan) throw new ApiError('Artisan introuvable', 404);
    return artisan;
  });
}

/** Artisans du même métier que `excludeId`, pour l'état « indisponible » du profil. */
export async function getArtisanAlternatives(excludeId: string): Promise<Artisan[]> {
  return simulateRequest(() => {
    const current = artisans.find((a) => a.id === excludeId);
    if (!current) return [];
    return artisans
      .filter((a) => a.id !== excludeId && a.categories.some((c) => current.categories.includes(c)))
      .filter((a) => !a.availability.unavailableUntil)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  });
}
