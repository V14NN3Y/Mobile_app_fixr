/**
 * Sert à la fois l'écran 07 (liste) et 07b (carte), différenciés par ?view=map
 * (docs/ECRANS.md : (tabs)/search/results?view=map) — pas deux fichiers séparés.
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function Results() {
  const { view } = useLocalSearchParams<{ view?: string }>();
  const isMap = view === 'map';

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: isMap ? 'Résultats · Carte' : 'Résultats' }}
      />
      <ScreenPlaceholder
        title={isMap ? '07b · Résultats (carte)' : '07 · Résultats (liste)'}
        route="(tabs)/search/results"
        description={
          isMap
            ? 'Lot 3 — design/ResultsMap.dc.html (react-native-maps, marqueurs note)'
            : 'Lot 3 — design/Results.dc.html (tri en sheet, puces de filtres, FlashList)'
        }
        links={[
          { label: 'Profil artisan →', href: '/artisan/koffi-agbodjan' },
          { label: 'Filtres →', href: '/filters' },
          { label: 'Demander →', href: '/request/need' },
          {
            label: isMap ? 'Vue liste' : 'Vue carte',
            href: isMap ? '/search/results' : '/search/results?view=map',
          },
        ]}
      />
    </>
  );
}
