import { ScreenPlaceholder } from '@/components/dev/ScreenPlaceholder';

export default function Bookings() {
  return (
    <ScreenPlaceholder
      title="14 · Réservations"
      route="(tabs)/bookings/index"
      description="Lot 5 — design/Bookings.dc.html (4 onglets avec compteurs, cartes, CTA)"
      links={[
        { label: 'Détail (FX-24817) →', href: '/bookings/FX-24817' },
        { label: '+ Demande →', href: '/request/need' },
      ]}
    />
  );
}
