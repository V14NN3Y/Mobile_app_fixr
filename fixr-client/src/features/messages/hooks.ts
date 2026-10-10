import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as messagesApi from './api';
import type { SendMessageInput } from './api';

/**
 * `networkMode: 'always'` partout dans ce fichier (requêtes ET mutations) : par défaut,
 * React Query met en pause aussi bien les mutations que les refetch déclenchés par
 * `invalidateQueries` tant que le navigateur se signale hors connexion (son propre
 * détecteur réseau global, indépendant de useIsConnected()) — ce qui empêchait purement et
 * simplement `sendMessage` de s'exécuter hors connexion, et aurait empêché le refetch après
 * `retryQueuedMessages` de s'exécuter au retour en ligne si la bascule réseau de React Query
 * n'avait pas encore rattrapé celle de NetInfo (constaté en testant avec
 * `page.context().setOffline(true)`/`false`). Nos requêtes/mutations n'appellent jamais de
 * vrai réseau (simulateRequest est un minuteur local) : rien ne justifie qu'elles soient
 * mises en pause par ce mécanisme.
 */
const ALWAYS = { networkMode: 'always' as const };

export function useConversations() {
  return useQuery({ ...ALWAYS, queryKey: ['messages', 'conversations'], queryFn: messagesApi.getConversations });
}

/** `select` sur la même clé que la liste principale (pas de requête séparée) : rien à
 * invalider en plus pour que le badge de l'onglet Messages/la pastille de la cloche
 * reflètent toute mutation qui touche déjà ['messages'] (leçon du ['home'] oublié, Lot 5). */
export function useUnreadMessagesCount() {
  return useQuery({
    ...ALWAYS,
    queryKey: ['messages', 'conversations'],
    queryFn: messagesApi.getConversations,
    select: (list) => list.reduce((sum, c) => sum + c.unread, 0),
  });
}

export function useConversation(id: string) {
  return useQuery({
    ...ALWAYS,
    queryKey: ['messages', 'conversation', id],
    queryFn: () => messagesApi.getConversationById(id),
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    ...ALWAYS,
    queryKey: ['messages', 'thread', conversationId],
    queryFn: () => messagesApi.getMessages(conversationId),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    ...ALWAYS,
    mutationFn: ({ input, isConnected }: { input: SendMessageInput; isConnected: boolean }) =>
      messagesApi.sendMessage(input, isConnected),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useMarkMessageDelivered() {
  const queryClient = useQueryClient();
  return useMutation({
    ...ALWAYS,
    mutationFn: (id: string) => messagesApi.markMessageDelivered(id),
    onSuccess: (message) => {
      void queryClient.invalidateQueries({ queryKey: ['messages', 'thread', message.conversationId] });
    },
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    ...ALWAYS,
    mutationFn: (id: string) => messagesApi.markMessageRead(id),
    onSuccess: (message) => {
      void queryClient.invalidateQueries({ queryKey: ['messages', 'thread', message.conversationId] });
    },
  });
}

export function useAppendArtisanReply() {
  const queryClient = useQueryClient();
  return useMutation({
    ...ALWAYS,
    mutationFn: ({ conversationId, text }: { conversationId: string; text: string }) =>
      messagesApi.appendArtisanReply(conversationId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useRetryQueuedMessages() {
  const queryClient = useQueryClient();
  return useMutation({
    ...ALWAYS,
    mutationFn: (conversationId: string) => messagesApi.retryQueuedMessages(conversationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    ...ALWAYS,
    mutationFn: (id: string) => messagesApi.markConversationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
