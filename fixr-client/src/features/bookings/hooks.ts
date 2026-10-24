import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { USE_MOCKS } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import type { BookingStatus } from '@/types/domain';

import * as bookingsApi from './api';

/** Lot 8, mode réel uniquement — suivi de mission en direct par Realtime (remplace, pour
 * les autres éventuels auditeurs, le minuteur client qui ne fait qu'avancer ce même
 * booking) : tout changement sur `bookings` ou `booking_events` pour cet id invalide la
 * requête, sans attendre l'invalidation manuelle d'advance-mission-stage. */
function useBookingRealtime(id: string) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (USE_MOCKS || !id) return;
    const channel = supabase
      .channel(`booking:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `id=eq.${id}` }, () => {
        void queryClient.invalidateQueries({ queryKey: ['bookings', 'byId', id] });
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'booking_events', filter: `booking_id=eq.${id}` },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['bookings', 'byId', id] });
        },
      )
      .subscribe();
    return () => void supabase.removeChannel(channel);
  }, [id, queryClient]);
}

export function useActiveBookingForArtisan(artisanId: string) {
  return useQuery({
    queryKey: ['bookings', 'activeForArtisan', artisanId],
    queryFn: () => bookingsApi.getActiveBookingForArtisan(artisanId),
  });
}

export function useBookings() {
  return useQuery({ queryKey: ['bookings', 'all'], queryFn: bookingsApi.getBookings });
}

export function useBooking(id: string) {
  useBookingRealtime(id);
  return useQuery({
    queryKey: ['bookings', 'byId', id],
    queryFn: () => bookingsApi.getBookingById(id),
    // Lot 8 : appelée avec `conversation.bookingId ?? ''` depuis le Chat (conversation
    // Support, sans réservation liée) — un id vide échouait déjà silencieusement en mode
    // mock (ApiError 404 jamais affichée), mais partait pour de vrai sur le réseau ; évite
    // l'aller-retour inutile, repéré via le logger dev de queryClient.ts.
    enabled: Boolean(id),
  });
}

// `home/api.ts`'s activeMission/lastBooking sont dérivés des mêmes `bookings` mock —
// invalider aussi ['home'] pour que l'écran d'accueil, s'il est déjà monté, reflète
// immédiatement une annulation ou une mission qui vient de se terminer.

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => bookingsApi.cancelBooking(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useRestoreBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, previousStatus }: { id: string; previousStatus: BookingStatus }) =>
      bookingsApi.restoreBooking(id, previousStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useAdvanceMissionStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.advanceMissionStage(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useReportForBooking(bookingId: string, enabled = true) {
  return useQuery({
    queryKey: ['bookings', 'report', bookingId],
    queryFn: () => bookingsApi.getReportForBooking(bookingId),
    enabled,
    retry: false,
  });
}

export function useQuotesForBooking(bookingId: string, enabled = true) {
  return useQuery({
    queryKey: ['bookings', 'quotes', bookingId],
    queryFn: () => bookingsApi.getQuotesForBooking(bookingId),
    enabled,
  });
}

export function useBookingIdsWithReport() {
  return useQuery({ queryKey: ['bookings', 'withReport'], queryFn: bookingsApi.getBookingIdsWithReport });
}

/** Lot 8 : bouton « Accepter ce devis » (app/(tabs)/bookings/[id]/index.tsx). */
export function useAcceptQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, quoteId }: { bookingId: string; quoteId: string }) =>
      bookingsApi.acceptQuote(bookingId, quoteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

/** Lot 8 : câblée sur « Confirmer la fin de l'intervention » (report.tsx). */
export function useValidateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.validateReport(bookingId),
    onSuccess: (_report, bookingId) => {
      void queryClient.invalidateQueries({ queryKey: ['bookings', 'report', bookingId] });
    },
  });
}
