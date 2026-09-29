import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

/**
 * Route racine, hors (tabs), présentation formSheet posée dans app/_layout.tsx
 * (Stack.Screen options={{ presentation: 'formSheet' }}).
 */
export default function Filters() {
  return (
    <ScreenPlaceholder
      title="08 · Filtres"
      route="filters (formSheet)"
      description="Lot 3 — design/Filters.dc.html (compteur « Afficher N artisans » en direct)"
      extra={
        <Button variant="secondary" onPress={() => router.back()}>
          Fermer
        </Button>
      }
    />
  );
}
