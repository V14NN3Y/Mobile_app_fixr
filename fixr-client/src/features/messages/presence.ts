/**
 * Ligne de présence de l'en-tête du Chat — « En ligne » (design/Chat.dc.html) ou « Vu à… »
 * (hors connexion, design/StatesA.dc.html col. 4). Seul le chemin hors-connexion est tiré
 * d'une maquette ; le repli « artisan hors ligne alors que l'appareil est connecté » n'a
 * pas de maquette contradictoire, retenu par cohérence plutôt qu'inventer un 3ᵉ état.
 */
import { formatTime } from '@/lib/format';
import type { Artisan, Conversation, Message } from '@/types/domain';

export function presenceLabel(
  artisan: Artisan | undefined,
  isConnected: boolean,
  messages: Message[],
  conversation: Conversation,
): string | null {
  if (!artisan) return null; // Support FIXR (pas d'artisanId) : pas de ligne de présence
  if (isConnected && artisan.online) return 'En ligne';

  const lastIncoming = [...messages].reverse().find((m) => !m.fromMe && m.kind !== 'system');
  return `Vu à ${formatTime(lastIncoming?.at ?? conversation.lastAt)}`;
}
