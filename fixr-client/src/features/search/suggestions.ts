/**
 * Suggestions de recherche — dérivation client (pas une requête réseau), design/Search.dc.html.
 * Combine catégories + artisans (déjà en cache) + listes statiques (lieux, services courants).
 */
import { fr } from '@/lib/i18n/fr';
import type { Artisan, Category } from '@/types/domain';

export type SuggestionKind = 'service' | 'artisan' | 'lieu';
export type SearchMode = 'tout' | SuggestionKind;

export type Suggestion = { kind: SuggestionKind; label: string; artisanId?: string };

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function buildSuggestionPool(categories: Category[], artisans: Artisan[]): Suggestion[] {
  const services: Suggestion[] = [
    ...categories.map((c) => ({ kind: 'service' as const, label: c.label })),
    ...fr.search.extraServices.map((label) => ({ kind: 'service' as const, label })),
  ];
  const artisanSuggestions: Suggestion[] = artisans.map((a) => ({
    kind: 'artisan',
    label: `${a.firstName} ${a.lastName} · ${a.trade}`,
    artisanId: a.id,
  }));
  const places: Suggestion[] = fr.search.places.map((label) => ({ kind: 'lieu', label }));

  return [...services, ...artisanSuggestions, ...places];
}

export function searchSuggestions(
  pool: Suggestion[],
  query: string,
  mode: SearchMode,
  limit = 7,
): Suggestion[] {
  const nq = normalize(query.trim());
  if (!nq) return [];
  return pool
    .filter((s) => (mode === 'tout' || mode === s.kind) && normalize(s.label).includes(nq))
    .slice(0, limit);
}
