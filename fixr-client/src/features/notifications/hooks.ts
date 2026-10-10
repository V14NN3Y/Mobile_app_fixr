import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as notificationsApi from './api';

export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.getNotifications });
}

/** `select` sur la même clé que la liste principale — même raison que
 * useUnreadMessagesCount() : la pastille de la cloche se met à jour sans clé séparée à
 * invalider. */
export function useUnreadNotificationsCount() {
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
