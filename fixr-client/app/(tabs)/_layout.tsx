/**
 * Barre d'onglets persistante — design/Components.dc.html « Barre de navigation ».
 * expo-router/ui (headless) : TabSlot affiche l'onglet actif, TabBar (custom) pilote
 * la navigation via ses <TabTrigger>. 5 onglets : Accueil, Rechercher, Réservations
 * (badge), Messages (badge), Profil.
 */
import { Tabs, TabSlot } from 'expo-router/ui';

import { TabBar } from '@/components/navigation/TabBar';

export default function TabsLayout() {
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabBar />
    </Tabs>
  );
}
