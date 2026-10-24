import { findActiveBookingForArtisan } from '@/features/artisans/profileState';
import { ApiError, simulateRequest } from '@/mocks/api';
import { bookings, NOW, quotes, reports } from '@/mocks/data';
import type { Booking, BookingStatus, InterventionReport, Quote } from '@/types/domain';

import { nextMissionTransition } from './missionStage';

export async function getActiveBookingForArtisan(artisanId: string): Promise<Booking | null> {
  return simulateRequest(() => findActiveBookingForArtisan(bookings, artisanId));
}

/** Toutes les réservations — base de l'onglet Réservations (Lot 5) et de la vérification
 * « la réservation créée apparaît dans « À venir » » du Lot 4. */
export async function getBookings(): Promise<Booking[]> {
  return simulateRequest(() => bookings);
}

export async function getBookingById(id: string): Promise<Booking> {
  return simulateRequest(() => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) throw new ApiError('Réservation introuvable', 404);
    return booking;
  });
}

function findBookingOrThrow(id: string): Booking {
  const booking = bookings.find((b) => b.id === id);
  if (!booking) throw new ApiError('Réservation introuvable', 404);
  return booking;
}

/**
 * `reason` est accepté (collecté par CancelBookingSheet) mais pas encore stocké : `Booking`
 * n'a pas de champ dédié et aucune maquette de ce lot n'affiche le motif ailleurs que dans
 * la feuille elle-même — pas de champ inventé pour une donnée qu'aucun écran ne lit.
 */
export async function cancelBooking(id: string, _reason?: string): Promise<Booking> {
  return simulateRequest(() => {
    const booking = findBookingOrThrow(id);
    booking.status = 'cancelled';
    booking.cancelledBy = 'client';
    booking.events = [...booking.events, { type: 'cancelled', at: new Date(NOW).toISOString() }];
    return booking;
  });
}

/** Annule l'annulation (toast « Annuler » pendant 5 s sur le détail de réservation). */
export async function restoreBooking(id: string, previousStatus: BookingStatus): Promise<Booking> {
  return simulateRequest(() => {
    const booking = findBookingOrThrow(id);
    booking.status = previousStatus;
    booking.cancelledBy = undefined;
    booking.events = booking.events.filter((e) => e.type !== 'cancelled');
    return booking;
  });
}

/** Fait avancer la mission d'une étape (table dans missionStage.ts) ; no-op si déjà
 * terminée ou si le statut n'est pas une étape de mission en direct. */
export async function advanceMissionStage(id: string): Promise<Booking> {
  return simulateRequest(() => {
    const booking = findBookingOrThrow(id);
    const next = nextMissionTransition(booking.status);
    if (!next) return booking;

    booking.status = next.status;
    // Horloge réelle (pas NOW figé) : seule mutation du lot à le faire, pour que la
    // timeline de la mission en direct montre des heures qui avancent pendant la démo.
    const at = new Date().toISOString();
    const existing = booking.events.find((e) => e.type === next.eventType);
    if (existing) existing.at = at;
    else booking.events = [...booking.events, { type: next.eventType, at }];

    return booking;
  });
}

export async function getReportForBooking(bookingId: string): Promise<InterventionReport> {
  return simulateRequest(() => {
    const report = reports.find((r) => r.bookingId === bookingId);
    if (!report) throw new ApiError('Rapport introuvable', 404);
    return report;
  });
}

export async function getQuotesForBooking(bookingId: string): Promise<Quote[]> {
  return simulateRequest(() => quotes.filter((q) => q.bookingId === bookingId));
}

/** Ids des réservations ayant une fiche de rapport — évite un N+1 de requêtes pour router
 * la puce « Noter X » (features/bookings/cta.ts) depuis la liste. */
export async function getBookingIdsWithReport(): Promise<string[]> {
  return simulateRequest(() => reports.map((r) => r.bookingId));
}

/** Lot 8 : bouton « Accepter ce devis » ajouté sur le détail réservation (aucune UI
 * n'appelait cette action jusqu'ici). Pas de champ status sur Quote côté mock (contrairement
 * au schéma réel) : rien d'autre à faire ici que de confirmer la réservation. */
export async function acceptQuote(bookingId: string, quoteId: string): Promise<Booking> {
  return simulateRequest(() => {
    const booking = findBookingOrThrow(bookingId);
    const quote = quotes.find((q) => q.id === quoteId && q.bookingId === bookingId);
    if (!quote) throw new ApiError('Devis introuvable', 404);
    booking.artisanId = quote.artisanId;
    booking.status = 'confirmed';
    booking.events = [...booking.events, { type: 'confirmed', at: new Date().toISOString() }];
    return booking;
  });
}

/** Lot 8 : câblée sur « Confirmer la fin de l'intervention », jusqu'ici une simple
 * navigation sans effet. */
export async function validateReport(bookingId: string): Promise<InterventionReport> {
  return simulateRequest(() => {
    const report = reports.find((r) => r.bookingId === bookingId);
    if (!report) throw new ApiError('Rapport introuvable', 404);
    report.status = 'validated';
    return report;
  });
}
