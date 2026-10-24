import { ApiError, simulateRequest } from '@/mocks/api';
import { notifications } from '@/mocks/data';
import type { AppNotification } from '@/types/domain';

export async function getNotifications(): Promise<AppNotification[]> {
  return simulateRequest(() => notifications);
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  return simulateRequest(() => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification) throw new ApiError('Notification introuvable', 404);
    notification.read = true;
    return notification;
  });
}

export async function markAllNotificationsRead(): Promise<AppNotification[]> {
  return simulateRequest(() => {
    for (const notification of notifications) notification.read = true;
    return notifications;
  });
}

// Lot 9 — aucune table `push_tokens` en mode mock, rien à persister : les écrans n'ont pas
// besoin de savoir si un envoi serveur réel est possible.
export async function registerPushToken(_token: string, _platform: 'ios' | 'android'): Promise<void> {
  return simulateRequest(() => undefined);
}
