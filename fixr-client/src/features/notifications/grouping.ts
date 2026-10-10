/**
 * Regroupement des notifications par date (design/Notifications.dc.html). Le tableau mock
 * n'est PAS chronologique globalement (n1 13:52 précède n2 14:02) : on trie d'abord par
 * `at` décroissant, puis on classe dans l'ordre fixe Aujourd'hui / Hier / Cette semaine /
 * Plus ancien (4ᵉ seau défensif, non illustré par les fixtures actuelles — aucune
 * notification mock n'a plus d'une semaine — mais nécessaire pour ne pas en perdre une
 * silencieusement si l'historique s'allonge).
 */
import type { AppNotification } from '@/types/domain';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function bucketFor(iso: string, now: Date): string {
  const d = new Date(iso);
  if (isSameCalendarDay(d, now)) return 'Aujourd’hui';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(d, yesterday)) return 'Hier';
  const daysAgo = Math.floor((startOfDay(now).getTime() - startOfDay(d).getTime()) / MS_PER_DAY);
  if (daysAgo <= 7) return 'Cette semaine';
  return 'Plus ancien';
}

export type NotificationDateGroup = { label: string; items: AppNotification[] };

const BUCKET_ORDER = ['Aujourd’hui', 'Hier', 'Cette semaine', 'Plus ancien'];

export function groupNotificationsByDate(notifications: AppNotification[], now: Date): NotificationDateGroup[] {
  const sorted = [...notifications].sort((a, b) => b.at.localeCompare(a.at));
  const byBucket = new Map<string, AppNotification[]>();
  for (const n of sorted) {
    const bucket = bucketFor(n.at, now);
    const items = byBucket.get(bucket);
    if (items) items.push(n);
    else byBucket.set(bucket, [n]);
  }
  return BUCKET_ORDER.filter((label) => byBucket.has(label)).map((label) => ({
    label,
    items: byBucket.get(label)!,
  }));
}
