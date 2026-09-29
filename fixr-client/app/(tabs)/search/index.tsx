import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function Search() {
  return (
    <ScreenPlaceholder
      title="06 · Recherche"
      route="(tabs)/search/index"
      description="Lot 3 — design/Search.dc.html (suggestions en direct, historique, demandes fréquentes)"
      links={[
        { label: 'Résultats (liste) →', href: '/search/results' },
        { label: 'Résultats (carte) →', href: '/search/results?view=map' },
        { label: 'Aucun résultat → Décrire mon besoin', href: '/request/need' },
      ]}
    />
  );
}
