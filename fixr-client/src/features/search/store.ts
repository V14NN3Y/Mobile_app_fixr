/**
 * Historique de recherche — design/Search.dc.html « Recherches récentes » (supprimable,
 * individuellement ou en bloc). Persisté (MMKV), amorcé depuis mocks/data.recentSearches.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/lib/storage';
import { recentSearches } from '@/mocks/data';

export type SearchHistoryItem = { label: string; where: string };

type SearchHistoryState = {
  history: SearchHistoryItem[];
  add: (item: SearchHistoryItem) => void;
  remove: (index: number) => void;
  clear: () => void;
};

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      history: recentSearches,
      add: (item) =>
        set((state) => ({
          history: [item, ...state.history.filter((h) => h.label !== item.label)].slice(0, 5),
        })),
      remove: (index) => set((state) => ({ history: state.history.filter((_, i) => i !== index) })),
      clear: () => set({ history: [] }),
    }),
    {
      name: 'fixr-search-history',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
