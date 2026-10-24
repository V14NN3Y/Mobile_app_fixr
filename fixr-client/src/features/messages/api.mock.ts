import { ApiError, simulateRequest } from '@/mocks/api';
import { conversations, messages } from '@/mocks/data';
import type { Conversation, Message } from '@/types/domain';

export type SendMessageInput = {
  conversationId: string;
  kind: 'text' | 'photo';
  text?: string;
  photoUrl?: string;
};

function findConversationOrThrow(id: string): Conversation {
  const conversation = conversations.find((c) => c.id === id);
  if (!conversation) throw new ApiError('Conversation introuvable', 404);
  return conversation;
}

function findMessageOrThrow(id: string): Message {
  const message = messages.find((m) => m.id === id);
  if (!message) throw new ApiError('Message introuvable', 404);
  return message;
}

/** Résumé de dernier message appliqué à conversations[] — chaque écriture qui change ce
 * qu'affiche la liste des conversations doit passer par ici (Conversation dénormalise
 * lastMessage/lastMessageMine/lastAt séparément de messages[]). */
function touchLastMessage(conversation: Conversation, message: Message): void {
  conversation.lastMessage = message.kind === 'photo' ? 'Photo' : (message.text ?? '');
  conversation.lastMessageMine = message.fromMe;
  conversation.lastAt = message.at;
}

export async function getConversations(): Promise<Conversation[]> {
  return simulateRequest(() => conversations);
}

export async function getConversationById(id: string): Promise<Conversation> {
  return simulateRequest(() => findConversationOrThrow(id));
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return simulateRequest(() => messages.filter((m) => m.conversationId === conversationId));
}

/**
 * `isConnected` est reçu en paramètre explicite (comme `advanceMissionStage` reçoit `id`) :
 * jamais d'état ambiant lu depuis cette couche, l'écran Chat reste seul responsable de la
 * connectivité (useIsConnected, src/lib/netinfo.ts).
 */
export async function sendMessage(input: SendMessageInput, isConnected: boolean): Promise<Message> {
  return simulateRequest(() => {
    const conversation = findConversationOrThrow(input.conversationId);
    const message: Message = {
      id: `msg${Date.now()}`,
      conversationId: input.conversationId,
      kind: input.kind,
      fromMe: true,
      text: input.text,
      photoUrl: input.photoUrl,
      status: isConnected ? 'sent' : 'queued',
      // Horloge réelle (pas NOW figé) : même exception qu'advanceMissionStage au Lot 5,
      // pour que les messages envoyés pendant la démo portent une heure crédible.
      at: new Date().toISOString(),
    };
    messages.push(message);
    touchLastMessage(conversation, message);
    return message;
  });
}

export async function markMessageDelivered(id: string): Promise<Message> {
  return simulateRequest(() => {
    const message = findMessageOrThrow(id);
    message.status = 'delivered';
    return message;
  });
}

export async function markMessageRead(id: string): Promise<Message> {
  return simulateRequest(() => {
    const message = findMessageOrThrow(id);
    message.status = 'read';
    return message;
  });
}

/** Réponse de l'artisan simulée après l'escalade (pickCannedReply côté écran) — n'incrémente
 * jamais `unread` : le fil est déjà ouvert quand elle arrive. */
export async function appendArtisanReply(conversationId: string, text: string): Promise<Message> {
  return simulateRequest(() => {
    const conversation = findConversationOrThrow(conversationId);
    const message: Message = {
      id: `msg${Date.now()}`,
      conversationId,
      kind: 'text',
      fromMe: false,
      text,
      at: new Date().toISOString(),
    };
    messages.push(message);
    touchLastMessage(conversation, message);
    return message;
  });
}

/** Rebascule chaque message `'queued'` du fil en `'sent'`, en conservant son `at` d'origine
 * (l'ordre chronologique doit refléter le moment de rédaction, pas celui de l'envoi
 * effectif). Renvoie les messages basculés pour que l'écran relance leur escalade. */
export async function retryQueuedMessages(conversationId: string): Promise<Message[]> {
  return simulateRequest(() => {
    const retried: Message[] = [];
    for (const message of messages) {
      if (message.conversationId === conversationId && message.status === 'queued') {
        message.status = 'sent';
        retried.push(message);
      }
    }
    return retried;
  });
}

export async function markConversationRead(id: string): Promise<Conversation> {
  return simulateRequest(() => {
    const conversation = findConversationOrThrow(id);
    conversation.unread = 0;
    return conversation;
  });
}
