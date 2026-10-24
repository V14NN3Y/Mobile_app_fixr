import { ApiError } from '@/lib/apiError';
import { requireUserId, supabase } from '@/lib/supabase';
import type { AppNotification } from '@/types/domain';

type Row = {
  id: string;
  type: AppNotification['type'];
  title: string;
  body: string;
  cta: string | null;
  deep_link: string;
  read_at: string | null;
  created_at: string;
};

const SELECT = 'id, type, title, body, cta, deep_link, read_at, created_at';

function toNotification(row: Row): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    cta: row.cta ?? undefined,
    deepLink: row.deep_link,
    read: row.read_at !== null,
    at: row.created_at,
  };
}

export async function getNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase.from('notifications').select(SELECT).order('created_at', { ascending: false });
  if (error) throw new ApiError(error.message);
  return (data as Row[]).map(toNotification);
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .select(SELECT)
    .maybeSingle();
  if (error) throw new ApiError(error.message);
  if (!data) throw new ApiError('Notification introuvable', 404);
  return toNotification(data as Row);
}

export async function markAllNotificationsRead(): Promise<AppNotification[]> {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) throw new ApiError(error.message);
  return getNotifications();
}

/** Lot 9 — appelée par src/features/notifications/push.ts une fois un jeton Expo obtenu
 * (nécessite un projectId EAS, absent tant qu'aucun compte n'existe). `token` est la clé
 * primaire de push_tokens : un même jeton réinstallé (même appareil) remplace simplement
 * la ligne existante au lieu d'en créer une en double. */
export async function registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
  const userId = await requireUserId();
  const { error } = await supabase.from('push_tokens').upsert({ user_id: userId, token, platform });
  if (error) throw new ApiError(error.message);
}
