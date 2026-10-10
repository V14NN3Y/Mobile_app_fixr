/**
 * Bulle de message — design/Chat.dc.html (texte/photo/système) + file hors connexion,
 * design/StatesA.dc.html col. 4 (bulle atténuée + légende « En attente de réseau »).
 */
import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { formatTime } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import type { ColorToken } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { Message } from '@/types/domain';

const SYSTEM_TONE_STYLE: Record<
  NonNullable<Message['systemTone']>,
  { bg: string; text: string; inkToken: ColorToken; icon?: IconName }
> = {
  success: { bg: 'bg-success-soft', text: 'text-success-ink', inkToken: 'successInk', icon: 'check' },
  accent: { bg: 'bg-accent-soft', text: 'text-accent-ink', inkToken: 'accentInk', icon: 'navigation' },
  neutral: { bg: 'bg-surface-muted', text: 'text-text-secondary', inkToken: 'textSecondary' },
};

export type MessageBubbleProps = { message: Message; testID?: string };

export function MessageBubble({ message, testID }: MessageBubbleProps) {
  const { colors } = useTheme();
  const t = fr.messages.chat;

  if (message.kind === 'system') {
    const tone = SYSTEM_TONE_STYLE[message.systemTone ?? 'neutral'];
    return (
      <View
        testID={testID}
        className={`flex-row items-center gap-1.5 self-center rounded-full px-3 py-1.5 ${tone.bg}`}
      >
        {tone.icon ? <Icon name={tone.icon} size={14} color={colors[tone.inkToken]} /> : null}
        <Text variant="caption" className={`font-body-bold ${tone.text}`}>
          {message.text} · {formatTime(message.at)}
        </Text>
      </View>
    );
  }

  const isQueued = message.status === 'queued';
  const isRead = message.status === 'read';

  return (
    <View testID={testID} className={message.fromMe ? 'items-end gap-1' : 'items-start gap-1'}>
      {message.kind === 'photo' ? (
        <View
          accessibilityLabel={t.photoSentLabel}
          className="h-[130px] w-[180px] items-center justify-center rounded-2xl bg-primary-soft"
          style={message.fromMe ? { borderBottomRightRadius: 6 } : { borderBottomLeftRadius: 6 }}
        >
          <Icon name="image" size={34} color={colors.primary} />
        </View>
      ) : (
        <View
          className={
            message.fromMe
              ? 'max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5'
              : 'max-w-[80%] rounded-2xl rounded-bl-md border border-border-subtle bg-surface px-3.5 py-2.5'
          }
          style={isQueued ? { opacity: 0.7 } : undefined}
        >
          <Text variant="body" tone={message.fromMe ? 'inherit' : 'default'} className={message.fromMe ? 'text-on-primary' : undefined}>
            {message.text}
          </Text>
        </View>
      )}

      {isQueued ? (
        <View className="flex-row items-center gap-1">
          <Icon name="clock" size={12} color={colors.warning} />
          <Text variant="micro" className="normal-case tracking-normal text-warning">
            {t.queuedCaption}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center gap-1">
          <Text variant="micro" tone="tertiary" className="normal-case tracking-normal">
            {formatTime(message.at)}
            {isRead ? ` · ${fr.messages.readReceipt}` : ''}
          </Text>
          {isRead ? <Icon name="checkDouble" size={14} color={colors.primary} /> : null}
        </View>
      )}
    </View>
  );
}
