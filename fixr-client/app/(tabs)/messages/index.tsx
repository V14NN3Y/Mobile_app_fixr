/**
 * Conversations — design/Messages.dc.html.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConversationRow } from '@/components/domain';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useAllArtisansForTrades } from '@/features/artisans/hooks';
import { useConversations } from '@/features/messages/hooks';
import { fr } from '@/lib/i18n/fr';
import { NOW } from '@/mocks/data';

export default function Messages() {
  const insets = useSafeAreaInsets();
  const t = fr.messages;
  const [query, setQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const conversationsQuery = useConversations();
  const artisansQuery = useAllArtisansForTrades([]);

  const isLoading = conversationsQuery.isLoading || artisansQuery.isLoading;
  const isError = conversationsQuery.isError || artisansQuery.isError;

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top + 16 }}>
        <View className="gap-3 px-5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={92} rounded={20} />
          ))}
        </View>
      </View>
    );
  }

  if (isError || !conversationsQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-5" style={{ paddingTop: insets.top }}>
        <Banner tone="error">{t.error.title}</Banner>
        <Button
          variant="primary"
          onPress={() => {
            void conversationsQuery.refetch();
            void artisansQuery.refetch();
          }}
        >
          {t.error.retry}
        </Button>
      </View>
    );
  }

  const artisans = artisansQuery.data?.items ?? [];
  const now = new Date(NOW);
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = conversationsQuery.data.filter((c) => {
    if (unreadOnly && c.unread === 0) return false;
    if (!normalizedQuery) return true;
    return (
      c.title.toLowerCase().includes(normalizedQuery) ||
      c.missionLabel.toLowerCase().includes(normalizedQuery)
    );
  });
  const unreadCount = conversationsQuery.data.filter((c) => c.unread > 0).length;

  return (
    <View className="flex-1 bg-bg">
      <View className="gap-3.5 px-5" style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}>
        <Text variant="title1" className="font-display">
          {t.title}
        </Text>
        <TextField
          icon="search"
          placeholder={t.searchPlaceholder}
          accessibilityLabel={t.searchLabel}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        <View className="flex-row gap-2">
          <Chip variant={!unreadOnly ? 'selected' : 'default'} onPress={() => setUnreadOnly(false)}>
            {t.tabAll}
          </Chip>
          <Chip variant={unreadOnly ? 'selected' : 'default'} onPress={() => setUnreadOnly(true)}>
            {t.unreadChip(unreadCount)}
          </Chip>
        </View>
      </View>

      {filtered.length === 0 ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          <EmptyState
            icon="message"
            title={normalizedQuery || unreadOnly ? t.emptyFilteredTitle : t.emptyTitle}
            description={normalizedQuery || unreadOnly ? t.emptyFilteredDescription : t.emptyDescription}
          />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: insets.bottom + 24 }}>
          {filtered.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              artisan={artisans.find((a) => a.id === conversation.artisanId)}
              now={now}
              onPress={() => router.push(`/messages/${conversation.id}`)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
