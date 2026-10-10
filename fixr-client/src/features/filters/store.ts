/**
 * Filtres et tri des résultats — design/Filters.dc.html + design/Results.dc.html.
 * État de session (pas de persist) : `draft` est édité par l'écran Filtres,
 * `applied` est ce que Résultats affiche réellement. `commitDraft()` fait passer l'un à
 * l'autre (bouton « Afficher N artisans »).
 */
import { create } from 'zustand';

import { createDefaultFilters, type ArtisanFilters, type ArtisanSort } from '@/features/artisans/types';
import type { CategoryId } from '@/theme/tokens';

type FiltersState = {
  applied: ArtisanFilters;
  draft: ArtisanFilters;
  sort: ArtisanSort;
  /** Fixe le métier de départ (tuile catégorie / suggestion de recherche) et réinitialise le reste. */
  startSearch: (trades: CategoryId[]) => void;
  setDraft: <K extends keyof ArtisanFilters>(key: K, value: ArtisanFilters[K]) => void;
  beginEdit: () => void;
  commitDraft: () => void;
  resetDraft: () => void;
  removeAppliedFilter: (keys: (keyof ArtisanFilters)[]) => void;
  setSort: (sort: ArtisanSort) => void;
};

export const useFiltersStore = create<FiltersState>()((set, get) => ({
  applied: createDefaultFilters(),
  draft: createDefaultFilters(),
  sort: 'relevance',

  startSearch: (trades) => set({ applied: createDefaultFilters(trades), draft: createDefaultFilters(trades), sort: 'relevance' }),
  setDraft: (key, value) => set((s) => ({ draft: { ...s.draft, [key]: value } })),
  beginEdit: () => set((s) => ({ draft: s.applied })),
  commitDraft: () => set((s) => ({ applied: s.draft })),
  resetDraft: () => set((s) => ({ draft: createDefaultFilters(s.applied.trades) })),
  removeAppliedFilter: (keys) => {
    const fallback = createDefaultFilters(get().applied.trades);
    set((s) => {
      const next = { ...s.applied };
      for (const key of keys) next[key] = fallback[key] as never;
      return { applied: next, draft: next };
    });
  },
  setSort: (sort) => set({ sort }),
}));
