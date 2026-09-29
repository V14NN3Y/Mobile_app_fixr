import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function Home() {
  return (
    <ScreenPlaceholder
      title="05 · Accueil"
      route="(tabs)/index"
      description="Lot 3 — design/Home.dc.html (sombre : HomeDark.dc.html)"
      links={[
        { label: 'Rechercher →', href: '/search' },
        { label: 'Réservations →', href: '/bookings' },
        { label: 'Messages →', href: '/messages' },
        { label: 'Profil →', href: '/profile' },
        { label: 'Notifications →', href: '/notifications' },
        { label: 'Décrire mon besoin →', href: '/request/need' },
      ]}
    />
  );
}
