import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';
import { Button } from '@/components/ui/Button';
import { useSessionStore } from '@/features/auth/store';

export default function Profile() {
  const signOut = useSessionStore((s) => s.signOut);

  return (
    <ScreenPlaceholder
      title="22 · Profil"
      route="(tabs)/profile/index"
      description="Lot 7 — design/Profile.dc.html"
      links={[
        { label: 'Paramètres →', href: '/profile/settings' },
        { label: 'Mes adresses →', href: '/profile/addresses' },
        { label: 'Moyens de paiement →', href: '/profile/payments' },
        { label: 'Favoris →', href: '/profile/favorites' },
        { label: 'Mes avis →', href: '/profile/reviews' },
        { label: 'Aide →', href: '/profile/help' },
      ]}
      extra={
        <Button variant="destructive" onPress={signOut}>
          Se déconnecter (dev)
        </Button>
      }
    />
  );
}
