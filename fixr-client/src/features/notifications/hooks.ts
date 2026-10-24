import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { USE_MOCKS } from '@/lib/env';
import { supabase } from '@/lib/supabase';

import * as notificationsApi from './api';

/** Lot 8, mode réel uniquement — remplace l'invalidation manuelle : une nouvelle
 * notification (insérée par advance-mission-stage, faute d'app Artisan dans ce dépôt)
 * met à jour la liste/le badge sans action du client. RLS filtre déjà par user_id. */
function useNotificationsRealtime() {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (USE_MOCKS) return;
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe();
    return () => void supabase.removeChannel(channel);
  }, [queryClient]);
}

export function useNotifications() {
  useNotificationsRealtime();
  return useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.getNotifications });
}

/** `select` sur la même clé que la liste principale — même raison que
 * useUnreadMessagesCount() : la pastille de la cloche se met à jour sans clé séparée à
 * invalider. */
export function useUnreadNotificationsCount() {
  useNotificationsRealtime();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
    select: (list) => list.filter((n) => !n.read).length,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
