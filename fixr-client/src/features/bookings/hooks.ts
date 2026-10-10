import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { BookingStatus } from '@/types/domain';

import * as bookingsApi from './api';

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
  return useQuery({ queryKey: ['bookings', 'byId', id], queryFn: () => bookingsApi.getBookingById(id) });
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
