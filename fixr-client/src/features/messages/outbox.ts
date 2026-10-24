/**
 * File d'attente hors-ligne (Lot 8, mode réel uniquement) — remplace le statut `'queued'`
 * du mock : Supabase n'a pas cette notion, un message non envoyé n'existe nulle part côté
 * serveur. Un envoi hors connexion est donc stocké ICI (MMKV, survit à un redémarrage de
 * l'app) jusqu'à ce que `drainOutbox()` (api.supabase.ts, qui a besoin du client Supabase —
 * pas importé ici pour éviter un cycle) le rejoue avec succès.
 *
 * Store pur : aucun appel réseau ici, seulement l'état de la file + l'invalidation React
 * Query qui la rend visible (useMessages lit la file via getMessages, voir api.supabase.ts).
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { queryClient } from '@/lib/queryClient';
import { mmkvStorage } from '@/lib/storage';

import type { SendMessageInput } from './api.mock';

export type OutboxEntry = {
  localId: string;
  conversationId: string;
  kind: 'text' | 'photo';
  text?: string;
  photoUri?: string; // uri locale device (image picker) ; uploadée au moment du drain
  createdAt: string;
  status: 'queued' | 'sending' | 'failed';
};

type OutboxState = {
  entries: OutboxEntry[];
  enqueue: (input: SendMessageInput) => OutboxEntry;
  entriesFor: (conversationId: string) => OutboxEntry[];
  remove: (localId: string) => void;
  markSending: (localId: string) => void;
  markFailed: (localId: string) => void;
};

function invalidateMessages() {
  void queryClient.invalidateQueries({ queryKey: ['messages'] });
}

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set, get) => ({
      entries: [],
      enqueue: (input) => {
        const entry: OutboxEntry = {
          localId: `outbox-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          conversationId: input.conversationId,
          kind: input.kind,
          text: input.text,
          photoUri: input.photoUrl,
          createdAt: new Date().toISOString(),
          status: 'queued',
        };
        set((s) => ({ entries: [...s.entries, entry] }));
        invalidateMessages();
        return entry;
      },
      entriesFor: (conversationId) => get().entries.filter((e) => e.conversationId === conversationId),
      remove: (localId) => {
        set((s) => ({ entries: s.entries.filter((e) => e.localId !== localId) }));
        invalidateMessages();
      },
      markSending: (localId) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.localId === localId ? { ...e, status: 'sending' } : e)),
        })),
      markFailed: (localId) => {
        set((s) => ({
          entries: s.entries.map((e) => (e.localId === localId ? { ...e, status: 'failed' } : e)),
        }));
        invalidateMessages();
      },
    }),
    { name: 'fixr-messages-outbox', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
