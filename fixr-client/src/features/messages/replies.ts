/**
 * Réponse automatique simulée après l'escalade d'un message envoyé (design/Chat.dc.html,
 * logique du prototype) — correspondance exacte sur les 3 réponses rapides, sinon repli
 * générique. Partagée par toutes les conversations : quickReplies (mocks/data.ts) est un
 * tableau global, pas propre à un artisan.
 */
import { quickReplies } from '@/mocks/data';

const CANNED_REPLIES: Record<string, string> = {
  [quickReplies[0]!]: 'Je suis au carrefour de la pharmacie, 3 minutes.',
  [quickReplies[1]!]: 'Oui, j’arrive vers 14h10, pas de souci.',
  [quickReplies[2]!]: 'Merci, je regarde ça tout de suite.',
};

const FALLBACK_REPLY = 'Bien reçu, merci !';

export function pickCannedReply(sentText: string): string {
  return CANNED_REPLIES[sentText] ?? FALLBACK_REPLY;
}
