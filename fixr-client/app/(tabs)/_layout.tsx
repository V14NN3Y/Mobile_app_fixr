/**
 * Barre d'onglets persistante — design/Components.dc.html « Barre de navigation ».
 * expo-router/ui (headless) : TabSlot affiche l'onglet actif, TabList/TabTrigger pilotent
 * la navigation. <TabList> doit être un enfant direct de <Tabs> (voir le commentaire de
 * src/components/navigation/TabBar.tsx) — c'est pourquoi la composition vit ici plutôt que
 * dans un composant <TabBar /> séparé. 5 onglets : Accueil, Rechercher, Réservations
 * (badge), Messages (badge), Profil.
 *
 * Masquage (bookings/[id]/live, messages/[threadId]) : hauteur ramenée à 0 plutôt que
 * démonté, pour que les routes de la barre restent enregistrées auprès du routeur de tabs.
 */
import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarButton, useHideTabBar } from '@/components/navigation/TabBar';
import { useUnreadMessagesCount } from '@/features/messages/hooks';

export default function TabsLayout() {
  const hidden = useHideTabBar();
  const insets = useSafeAreaInsets();
  const unreadMessages = useUnreadMessagesCount();

  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList
        style={{
          height: hidden ? 0 : 54 + insets.bottom,
          paddingBottom: hidden ? 0 : insets.bottom,
          overflow: 'hidden',
        }}
        className="border-t border-border-subtle bg-surface"
      >
        <TabTrigger name="home" href="/" asChild>
          <TabBarButton icon="home" label="Accueil" />
        </TabTrigger>
        <TabTrigger name="search" href="/search" asChild>
          <TabBarButton icon="search" label="Rechercher" />
        </TabTrigger>
        <TabTrigger name="bookings" href="/bookings" asChild>
          <TabBarButton icon="calendar" label="Réservations" badge={1} />
        </TabTrigger>
        <TabTrigger name="messages" href="/messages" asChild>
          <TabBarButton icon="message" label="Messages" badge={unreadMessages.data ?? 0} />
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <TabBarButton icon="user" label="Profil" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
