/**
 * Sert à la fois l'écran 07 (liste) et 07b (carte), différenciés par ?view=map
 * (docs/ECRANS.md : (tabs)/search/results?view=map) — pas deux fichiers séparés.
 * design/Results.dc.html + design/ResultsMap.dc.html.
 */
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useCategories } from '@/features/categories/hooks';
import { useFiltersStore } from '@/features/filters/store';
import { ResultsListScreen } from '@/features/results/components/ResultsListScreen';
import { ResultsMapScreen } from '@/features/results/components/ResultsMapScreen';
import type { CategoryId } from '@/theme/tokens';

export default function Results() {
  const { view, categoryId } = useLocalSearchParams<{ view?: string; categoryId?: CategoryId }>();
  const isMap = view === 'map';

  const categoriesQuery = useCategories();
  const startSearch = useFiltersStore((s) => s.startSearch);
  const lastCategoryId = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Nouvelle recherche (tuile catégorie / suggestion) : réinitialise filtres et tri.
    // Si categoryId est absent (ex. « Voir plus » depuis l'Accueil), ne réinitialise pas
    // une recherche déjà en cours (retour depuis Filtres/Carte).
    if (categoryId && categoryId !== lastCategoryId.current) {
      startSearch([categoryId]);
    }
    lastCategoryId.current = categoryId;
  }, [categoryId, startSearch]);

  const category = categoriesQuery.data?.find((c) => c.id === categoryId);

  return isMap ? (
    <ResultsMapScreen category={category} />
  ) : (
    <ResultsListScreen category={category} />
  );
}
