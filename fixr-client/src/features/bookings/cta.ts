/**
 * Puce d'action contextuelle des cartes Réservations — design/Bookings.dc.html. Dérivé du
 * statut réel (+ présence d'un rapport), pas copié littéralement par réservation : la
 * maquette route toujours « Noter » vers Rapport.dc.html même pour des réservations sans
 * fiche réelle (ex. FX-24402) — ici corrigé pour pointer directement vers l'évaluation
 * quand aucun rapport n'existe.
 */
import type { Href } from 'expo-router';

import type { Booking } from '@/types/domain';

export type BookingCta = { label: string; href: Href } | null;

export function ctaForBooking(
  booking: Booking,
  artisanFirstName: string | undefined,
  hasReport: boolean,
): BookingCta {
  switch (booking.status) {
    case 'quotes':
      return { label: 'Comparer les devis', href: `/bookings/${booking.id}` };
    case 'on_the_way':
      return {
        label: `Suivre l'arrivée${booking.etaMin !== undefined ? ` · ${booking.etaMin} min` : ''}`,
        href: `/bookings/${booking.id}/live`,
      };
    case 'on_site':
    case 'in_progress':
      return { label: 'Suivre la mission', href: `/bookings/${booking.id}/live` };
    case 'done':
      if (booking.reviewed) return null;
      return {
        label: `Noter ${artisanFirstName ?? "l'artisan"}`,
        href: hasReport ? `/bookings/${booking.id}/report` : `/bookings/${booking.id}/review`,
      };
    case 'cancelled':
      return { label: 'Refaire une demande', href: '/request/need' };
    default:
      return null;
  }
}
