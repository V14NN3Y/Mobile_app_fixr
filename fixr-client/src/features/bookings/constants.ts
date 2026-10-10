/**
 * Frais d'annulation après l'échéance gratuite — design/BookingDetail.dc.html +
 * design/StatesB.dc.html col. 2. Valeur fixe : aucune des réservations mock ne porte de
 * montant par réservation, et les deux sources de la maquette utilisent la même valeur
 * quelle que soit la réservation — choix documenté, pas une donnée inventée par cas.
 */
export const CANCELLATION_FEE_FCFA = 2000;

/** Cadence de la simulation de mission en direct (features/bookings/hooks.ts). */
export const MISSION_TICK_MS = 5000;
