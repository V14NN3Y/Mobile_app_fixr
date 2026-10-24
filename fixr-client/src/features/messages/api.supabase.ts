import { getCategories } from '@/features/categories/api.supabase';
import { ApiError } from '@/lib/apiError';
import { requireUserId, supabase } from '@/lib/supabase';
import type { Conversation, Message } from '@/types/domain';

import type { SendMessageInput } from './api.mock';
import { useOutboxStore } from './outbox';

// conversations.artisan_id référence artisans, pas profiles directement — 2 sauts
// (artisans → profiles) pour le nom affiché.
const CONVERSATION_SELECT = `id, booking_id, client_id, artisan_id, is_support, created_at, client_last_read_at,
  artisans(profiles!artisans_id_fkey(first_name, last_name)),
  bookings(id, title, category_id),
  messages(id, sender_id, kind, body, photo_path, system_tone, delivered_at, read_at, created_at)`;

type ConversationRow = {
  id: string;
  booking_id: string | null;
  client_id: string;
  artisan_id: string | null;
  is_support: boolean;
  created_at: string;
  client_last_read_at: string;
  artisans: { profiles: { first_name: string; last_name: string } | null } | null;
  bookings: { id: string; title: string; category_id: string } | null;
  messages: MessageRow[];
};

type MessageRow = {
  id: string;
  sender_id: string | null;
  kind: Message['kind'];
  body: string | null;
  photo_path: string | null;
  system_tone: Message['systemTone'] | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
};

function toMessage(row: MessageRow, userId: string): Message {
  return {
    id: row.id,
    conversationId: '', // rempli par l'appelant (non présent dans ce select imbriqué)
    kind: row.kind,
    fromMe: row.sender_id === userId,
    text: row.body ?? undefined,
    photoUrl: row.photo_path ?? undefined,
    systemTone: row.system_tone ?? undefined,
    status: row.read_at ? 'read' : row.delivered_at ? 'delivered' : 'sent',
    at: row.created_at,
  };
}

async function toConversation(
  row: ConversationRow,
  userId: string,
  categoryLabels: Map<string, string>,
): Promise<Conversation> {
  const sorted = [...row.messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const last = sorted[sorted.length - 1];
  const unread = row.messages.filter(
    (m) => m.sender_id !== userId && m.sender_id !== null && m.created_at > row.client_last_read_at,
  ).length;

  const artisanProfile = row.artisans?.profiles;
  const title = artisanProfile
    ? `${artisanProfile.first_name} ${artisanProfile.last_name}`
    : row.is_support
      ? 'Support FIXR'
      : '';
  const missionLabel = row.bookings
    ? `${categoryLabels.get(row.bookings.category_id) ?? ''} · ${row.bookings.id}`
    : row.is_support
      ? 'Assistance'
      : '';

  return {
    id: row.id,
    artisanId: row.artisan_id ?? undefined,
    title,
    bookingId: row.booking_id ?? undefined,
    missionLabel,
    lastMessage: last ? (last.kind === 'photo' ? 'Photo' : last.body ?? '') : '',
    lastMessageMine: last ? last.sender_id === userId : false,
    lastAt: last?.created_at ?? row.created_at,
    unread,
  };
}

export async function getConversations(): Promise<Conversation[]> {
  const userId = await requireUserId();
  const [{ data, error }, categories] = await Promise.all([
    supabase.from('conversations').select(CONVERSATION_SELECT),
    getCategories(),
  ]);
  if (error) throw new ApiError(error.message);
  const categoryLabels = new Map(categories.map((c) => [c.id as string, c.label]));
  const rows = data as unknown as ConversationRow[];
  return Promise.all(rows.map((row) => toConversation(row, userId, categoryLabels)));
}

export async function getConversationById(id: string): Promise<Conversation> {
  const userId = await requireUserId();
  const [{ data, error }, categories] = await Promise.all([
    supabase.from('conversations').select(CONVERSATION_SELECT).eq('id', id).maybeSingle(),
    getCategories(),
  ]);
  if (error) throw new ApiError(error.message);
  if (!data) throw new ApiError('Conversation introuvable', 404);
  const categoryLabels = new Map(categories.map((c) => [c.id as string, c.label]));
  return toConversation(data as unknown as ConversationRow, userId, categoryLabels);
}

/** Messages persistés + file hors-ligne de ce fil (outbox.ts), fusionnés et triés — voir le
 * commentaire d'en-tête d'outbox.ts : un message en attente n'existe nulle part côté serveur. */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, kind, body, photo_path, system_tone, delivered_at, read_at, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw new ApiError(error.message);

  const persisted = (data as MessageRow[]).map((row) => ({ ...toMessage(row, userId), conversationId }));
  const queued = useOutboxStore.getState().entriesFor(conversationId);
  const outboxMessages: Message[] = queued.map((entry) => ({
    id: entry.localId,
    conversationId: entry.conversationId,
    kind: entry.kind,
    fromMe: true,
    text: entry.text,
    photoUrl: entry.photoUri,
    status: entry.status,
    at: entry.createdAt,
  }));

  return [...persisted, ...outboxMessages].sort((a, b) => a.at.localeCompare(b.at));
}

async function uploadPhotoIfNeeded(conversationId: string, photoUri: string): Promise<string> {
  const path = `${conversationId}/${Date.now()}.jpg`;
  const response = await fetch(photoUri);
  const blob = await response.blob();
  const { error } = await supabase.storage.from('message-photos').upload(path, blob, { upsert: true });
  if (error) throw new ApiError(error.message);
  return path;
}

async function insertMessageNow(input: SendMessageInput): Promise<Message> {
  const userId = await requireUserId();
  const photoPath = input.kind === 'photo' && input.photoUrl ? await uploadPhotoIfNeeded(input.conversationId, input.photoUrl) : null;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_id: userId,
      kind: input.kind,
      body: input.text ?? null,
      photo_path: photoPath,
    })
    .select('id, sender_id, kind, body, photo_path, system_tone, delivered_at, read_at, created_at')
    .single();
  if (error) throw new ApiError(error.message);
  return { ...toMessage(data as MessageRow, userId), conversationId: input.conversationId };
}

/**
 * Hors connexion (ou échec réseau même si `isConnected` l'annonçait) : mis en file plutôt
 * que perdu — voir outbox.ts. Le message optimiste renvoyé a `status:'queued'`, exactement
 * comme le faisait le mock.
 */
export async function sendMessage(input: SendMessageInput, isConnected: boolean): Promise<Message> {
  if (!isConnected) {
    const entry = useOutboxStore.getState().enqueue(input);
    return {
      id: entry.localId,
      conversationId: entry.conversationId,
      kind: entry.kind,
      fromMe: true,
      text: entry.text,
      photoUrl: entry.photoUri,
      status: 'queued',
      at: entry.createdAt,
    };
  }
  try {
    return await insertMessageNow(input);
  } catch {
    const entry = useOutboxStore.getState().enqueue(input);
    return {
      id: entry.localId,
      conversationId: entry.conversationId,
      kind: entry.kind,
      fromMe: true,
      text: entry.text,
      photoUrl: entry.photoUri,
      status: 'queued',
      at: entry.createdAt,
    };
  }
}

export async function markMessageDelivered(id: string): Promise<Message> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('messages')
    .update({ delivered_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, sender_id, kind, body, photo_path, system_tone, delivered_at, read_at, created_at, conversation_id')
    .single();
  if (error) throw new ApiError(error.message);
  return { ...toMessage(data as MessageRow, userId), conversationId: (data as { conversation_id: string }).conversation_id };
}

export async function markMessageRead(id: string): Promise<Message> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, sender_id, kind, body, photo_path, system_tone, delivered_at, read_at, created_at, conversation_id')
    .single();
  if (error) throw new ApiError(error.message);
  return { ...toMessage(data as MessageRow, userId), conversationId: (data as { conversation_id: string }).conversation_id };
}

/** Voir supabase/functions/simulate-artisan-reply : un client ne peut jamais insérer un
 * message au nom de l'artisan directement (RLS), donc Edge Function dédiée — même
 * raisonnement qu'advance-mission-stage (pas d'app Artisan dans ce dépôt). */
export async function appendArtisanReply(conversationId: string, text: string): Promise<Message> {
  const { data, error } = await supabase.functions.invoke<MessageRow>('simulate-artisan-reply', {
    body: { conversationId, text },
  });
  if (error) throw new ApiError(error.message);
  const userId = await requireUserId();
  return { ...toMessage(data!, userId), conversationId };
}

/** Rejoue dans l'ordre les messages en file pour ce fil ; s'arrête au premier échec (ordre
 * chronologique préservé — pas de retry désordonné). */
export async function retryQueuedMessages(conversationId: string): Promise<Message[]> {
  const store = useOutboxStore.getState();
  const queued = store.entriesFor(conversationId).filter((e) => e.status === 'queued');
  const sent: Message[] = [];
  for (const entry of queued) {
    store.markSending(entry.localId);
    try {
      const message = await insertMessageNow({
        conversationId: entry.conversationId,
        kind: entry.kind,
        text: entry.text,
        photoUrl: entry.photoUri,
      });
      store.remove(entry.localId);
      sent.push(message);
    } catch {
      store.markFailed(entry.localId);
      break;
    }
  }
  return sent;
}

export async function markConversationRead(id: string): Promise<Conversation> {
  const { error } = await supabase
    .from('conversations')
    .update({ client_last_read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new ApiError(error.message);
  return getConversationById(id);
}
