/**
 * Ligne de conversation — design/Messages.dc.html. Pastille non-lus OU coche de lecture
 * double (jamais les deux : la coche n'apparaît que sur mon propre dernier message sortant).
 * Un seul Pressable (via Card), aucun enfant interactif — pas de risque d'imbrication.
 */
import { View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { formatConversationTime, getInitials } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { Artisan, Conversation } from '@/types/domain';

import { Card } from '../ui/Card';

export type ConversationRowProps = {
  conversation: Conversation;
  artisan?: Artisan;
  now: Date;
  onPress: () => void;
  testID?: string;
};

export function ConversationRow({ conversation, artisan, now, onPress, testID }: ConversationRowProps) {
  const { colors } = useTheme();
  const t = fr.messages;

  const initials = artisan ? getInitials(artisan.firstName, artisan.lastName) : conversation.title.charAt(0);
  const hasUnread = conversation.unread > 0;
  const showReadReceipt = !hasUnread && conversation.lastMessageMine;
  const messageText = conversation.lastMessageMine
    ? `${t.youPrefix}${conversation.lastMessage}`
    : conversation.lastMessage;

  return (
    <Card testID={testID} onPress={onPress} className="flex-row items-center gap-3 p-3">
      <Avatar initials={initials} seed={conversation.artisanId ?? conversation.id} online={artisan?.online} />

      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-baseline justify-between gap-2">
          <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
            {conversation.title}
          </Text>
          <Text
            variant="caption"
            tone={hasUnread ? 'default' : 'tertiary'}
            className={hasUnread ? 'font-body-extrabold text-primary' : undefined}
          >
            {formatConversationTime(conversation.lastAt, now)}
          </Text>
        </View>
        <Text variant="caption" tone="secondary" numberOfLines={1}>
          {conversation.missionLabel}
        </Text>
        <View className="flex-row items-center justify-between gap-2">
          <Text
            variant="body"
            numberOfLines={1}
            className={hasUnread ? 'flex-1 font-body-extrabold' : 'flex-1'}
            tone={hasUnread ? 'default' : 'secondary'}
          >
            {messageText}
          </Text>
          {hasUnread ? <Badge mode="count" value={conversation.unread} /> : null}
          {showReadReceipt ? <Icon name="checkDouble" size={18} color={colors.primary} /> : null}
        </View>
      </View>
    </Card>
  );
}
