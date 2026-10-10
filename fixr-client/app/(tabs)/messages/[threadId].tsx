/**
 * Chat — design/Chat.dc.html + file hors connexion design/StatesA.dc.html col. 4.
 * Tab bar déjà masquée sur cet écran (src/components/navigation/TabBar.tsx, useHideTabBar).
 */
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useArtisan } from '@/features/artisans/hooks';
import { useBooking } from '@/features/bookings/hooks';
import { stageForStatus } from '@/features/bookings/missionStage';
import { MessageBubble } from '@/features/messages/components/MessageBubble';
import { OfflineCallCard } from '@/features/messages/components/OfflineCallCard';
import { QuickReplies } from '@/features/messages/components/QuickReplies';
import { TypingIndicator } from '@/features/messages/components/TypingIndicator';
import { DELIVERED_DELAY_MS, READ_DELAY_MS, REPLY_DELAY_MS } from '@/features/messages/constants';
import { formatChatDayLabel, groupMessagesByDay } from '@/features/messages/grouping';
import {
  useAppendArtisanReply,
  useConversation,
  useMarkMessageDelivered,
  useMarkMessageRead,
  useMessages,
  useRetryQueuedMessages,
  useSendMessage,
} from '@/features/messages/hooks';
import { presenceLabel } from '@/features/messages/presence';
import { pickCannedReply } from '@/features/messages/replies';
import { NOW, quickReplies } from '@/mocks/data';
import { formatTime } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useIsConnected } from '@/lib/netinfo';
import { useTheme } from '@/theme/useTheme';
import type { Message } from '@/types/domain';

type ChatListItem =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'message'; key: string; message: Message }
  | { kind: 'typing'; key: string };

export default function Chat() {
  const insets = useSafeAreaInsets();
  const { colors, categoryTints } = useTheme();
  const t = fr.messages.chat;
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const isConnected = useIsConnected();

  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wasConnected = useRef(isConnected);
  const listRef = useRef<FlashListRef<ChatListItem>>(null);

  const conversationQuery = useConversation(threadId);
  const messagesQuery = useMessages(threadId);
  const artisanQuery = useArtisan(
    conversationQuery.data?.artisanId ?? '',
    Boolean(conversationQuery.data?.artisanId),
  );
  const bookingQuery = useBooking(conversationQuery.data?.bookingId ?? '');

  const sendMutation = useSendMessage();
  const deliverMutation = useMarkMessageDelivered();
  const readMutation = useMarkMessageRead();
  const replyMutation = useAppendArtisanReply();
  const retryMutation = useRetryQueuedMessages();

  function scheduleEscalation(messageId: string, text: string) {
    timers.current.push(
      setTimeout(() => deliverMutation.mutate(messageId), DELIVERED_DELAY_MS),
      setTimeout(() => {
        readMutation.mutate(messageId);
        setTyping(true);
      }, READ_DELAY_MS),
      setTimeout(() => {
        setTyping(false);
        replyMutation.mutate({ conversationId: threadId, text: pickCannedReply(text) });
      }, REPLY_DELAY_MS),
    );
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!wasConnected.current && isConnected) {
      retryMutation.mutate(threadId, {
        onSuccess: (retried) => retried.forEach((m) => scheduleEscalation(m.id, m.text ?? '')),
      });
    }
    wasConnected.current = isConnected;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- retryMutation change de référence à chaque rendu, pas une vraie dépendance
  }, [isConnected, threadId]);

  // Défile vers le bas à chaque nouveau message/statut/apparition de l'indicateur de frappe —
  // dépendances lues directement sur les données de requête (pas sur `items`, calculé plus
  // bas après les retours anticipés, donc indisponible ici pour un Hook).
  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messagesQuery.data?.length, typing]);

  function handleSend(text: string) {
    if (!text.trim()) return;
    setDraft('');
    sendMutation.mutate(
      { input: { conversationId: threadId, kind: 'text', text }, isConnected },
      {
        onSuccess: (message) => {
          if (message.status === 'sent') scheduleEscalation(message.id, text);
        },
      },
    );
  }

  async function handleAttachPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (result.canceled) return;
    sendMutation.mutate(
      { input: { conversationId: threadId, kind: 'photo', photoUrl: result.assets[0]?.uri }, isConnected },
      { onSuccess: (message) => (message.status === 'sent' ? scheduleEscalation(message.id, '') : undefined) },
    );
  }

  const isLoading = conversationQuery.isLoading || messagesQuery.isLoading;

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Skeleton height={300} rounded={0} />
      </View>
    );
  }

  if (conversationQuery.isError || !conversationQuery.data || !messagesQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-5" style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: true, title: fr.messages.title }} />
        <Banner tone="error">{t.notFound}</Banner>
        <Button variant="primary" onPress={() => router.back()}>
          {t.backLabel}
        </Button>
      </View>
    );
  }

  const conversation = conversationQuery.data;
  const artisan = artisanQuery.data;
  const booking = bookingQuery.data;
  const messages = messagesQuery.data;
  // Ancré sur le NOW figé des mocks (pas l'horloge réelle) : les fixtures de c_koffi doivent
  // rester « Aujourd'hui » même si la session tourne plusieurs jours après leur rédaction —
  // seuls les horodatages des messages envoyés pendant la démo (api.ts) utilisent l'horloge
  // réelle, par cohérence avec advanceMissionStage au Lot 5.
  const now = new Date(NOW);

  const initials = artisan ? artisan.firstName.charAt(0) + artisan.lastName.charAt(0) : conversation.title.charAt(0);
  const presence = presenceLabel(artisan, isConnected, messages, conversation);

  const items: ChatListItem[] = groupMessagesByDay(messages, now).flatMap((group) => [
    { kind: 'day' as const, key: `day-${group.label}`, label: group.label },
    ...group.messages.map((message) => ({ kind: 'message' as const, key: message.id, message })),
  ]);
  if (typing && artisan) items.push({ kind: 'typing', key: 'typing' });

  const tint = booking ? categoryTints[booking.categoryId] : undefined;
  const missionHref = booking
    ? stageForStatus(booking.status) !== null
      ? (`/bookings/${booking.id}/live` as const)
      : (`/bookings/${booking.id}` as const)
    : undefined;

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="gap-2" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center gap-1.5 px-2 pb-1">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t.backLabel}
            className="h-11 w-11 items-center justify-center"
          >
            <Icon name="chevronLeft" size={22} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => artisan && router.push(`/artisan/${artisan.id}`)}
            disabled={!artisan}
            accessibilityRole="button"
            className="min-w-0 flex-1 flex-row items-center gap-2.5 py-1.5"
          >
            <Avatar initials={initials} seed={conversation.artisanId ?? conversation.id} size={40} online={artisan?.online && isConnected} />
            <View className="min-w-0">
              <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
                {conversation.title}
              </Text>
              {presence ? (
                <Text
                  variant="caption"
                  className={isConnected && artisan?.online ? 'font-body-bold text-success-ink' : undefined}
                  tone={isConnected && artisan?.online ? undefined : 'tertiary'}
                >
                  {presence}
                </Text>
              ) : null}
            </View>
          </Pressable>
          <Pressable
            onPress={() => artisan?.phone && void Linking.openURL(`tel:${artisan.phone}`)}
            disabled={!artisan?.phone}
            accessibilityRole="button"
            accessibilityLabel={t.callLabel(conversation.title)}
            className="h-11 w-11 items-center justify-center"
          >
            <Icon name="call" size={20} color={artisan?.phone ? colors.text : colors.textDisabled} />
          </Pressable>
        </View>

        {booking && missionHref ? (
          <Pressable
            onPress={() => router.push(missionHref)}
            accessibilityRole="button"
            className="mx-4 flex-row items-center gap-2.5 rounded-2xl border border-border-subtle bg-surface p-3"
          >
            {tint ? (
              <View className="h-[34px] w-[34px] items-center justify-center rounded-xl" style={{ backgroundColor: tint.bg }}>
                <Icon name={booking.categoryId} size={18} color={tint.ink} />
              </View>
            ) : null}
            <View className="min-w-0 flex-1">
              <Text variant="caption" className="font-body-extrabold" numberOfLines={1}>
                {conversation.title === booking.title ? booking.title : `${booking.title} · ${booking.id}`}
              </Text>
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                {t.missionCardSubtitle(formatChatDayLabel(booking.slotStart, now), formatTime(booking.slotStart), formatTime(booking.slotEnd))}
              </Text>
            </View>
            <Badge mode="status" status={booking.status} />
            <Icon name="chevronRight" size={16} color={colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      {!isConnected ? <Banner tone="offline">{t.offlineBanner}</Banner> : null}

      <FlashList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.key}
        getItemType={(item) => item.kind}
        contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
        onLoad={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          if (item.kind === 'day') {
            return (
              <Text variant="caption" tone="tertiary" className="self-center py-2 normal-case tracking-normal">
                {item.label}
              </Text>
            );
          }
          if (item.kind === 'typing') {
            return artisan ? <TypingIndicator artisanFirstName={artisan.firstName} /> : null;
          }
          return (
            <View className="py-1">
              <MessageBubble message={item.message} />
            </View>
          );
        }}
      />

      {!isConnected ? <OfflineCallCard artisanFirstName={artisan?.firstName ?? conversation.title} phone={artisan?.phone} /> : null}

      <View className="gap-2.5 border-t border-border-subtle bg-surface pt-2.5" style={{ paddingBottom: insets.bottom + 10 }}>
        <QuickReplies replies={quickReplies} onPick={handleSend} />
        <View className="flex-row items-center gap-1.5 px-3">
          <Pressable
            onPress={handleAttachPhoto}
            accessibilityRole="button"
            accessibilityLabel={t.attachPhotoLabel}
            className="h-11 w-11 items-center justify-center rounded-xl bg-surface-muted"
          >
            <Icon name="photo" size={20} color={colors.text} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t.messagePlaceholder}
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel={t.messageInputLabel}
            onSubmitEditing={() => handleSend(draft)}
            returnKeyType="send"
            className="h-11 flex-1 rounded-full border-[1.5px] px-4 text-text"
            style={{ borderColor: colors.border, backgroundColor: colors.bg, color: colors.text }}
          />
          <Pressable
            onPress={() => handleSend(draft)}
            disabled={!draft.trim()}
            accessibilityRole="button"
            accessibilityLabel={t.sendLabel}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: draft.trim() ? colors.primary : colors.controlMuted }}
          >
            <Icon name="send" size={18} color={colors.onControlMuted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
