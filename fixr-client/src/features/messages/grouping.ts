/**
 * Regroupement des messages par jour (séparateurs du Chat, design/Chat.dc.html : pastille
 * « Aujourd'hui »). Pur, testé contre les vrais messages de c_koffi.
 */
import { formatWeekdayDate } from '@/lib/format';
import type { Message } from '@/types/domain';

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "Aujourd'hui" | "Hier" | formatWeekdayDate(iso) (ex. « mar. 15 sept. »). */
export function formatChatDayLabel(iso: string, now: Date): string {
  const d = new Date(iso);
  if (isSameCalendarDay(d, now)) return 'Aujourd’hui';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(d, yesterday)) return 'Hier';
  return formatWeekdayDate(iso);
}

export type ChatDayGroup = { label: string; messages: Message[] };

/** Regroupe une liste de messages (déjà chronologique) par jour calendaire. */
export function groupMessagesByDay(messages: Message[], now: Date): ChatDayGroup[] {
  const groups: ChatDayGroup[] = [];
  for (const message of messages) {
    const label = formatChatDayLabel(message.at, now);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.messages.push(message);
    } else {
      groups.push({ label, messages: [message] });
    }
  }
  return groups;
}
