/**
 * Ligne de notification — design/Notifications.dc.html. Icône typée (NOTIFICATION_TYPE_STYLE),
 * pastille non-lue (point, pas un compteur), fond blanc si non lue sinon transparent.
 */
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { NOTIFICATION_TYPE_STYLE } from '@/features/notifications/typeStyle';
import { formatConversationTime } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { colorClasses } from '@/theme/colorClasses';
import { useTheme } from '@/theme/useTheme';
import type { AppNotification } from '@/types/domain';

export type NotificationRowProps = {
  notification: AppNotification;
  now: Date;
  onPress: () => void;
  testID?: string;
};

export function NotificationRow({ notification, now, onPress, testID }: NotificationRowProps) {
  const { colors } = useTheme();
  const style = NOTIFICATION_TYPE_STYLE[notification.type];
  const bgClass = colorClasses[style.bgToken].bg;
  const unread = !notification.read;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      className={`relative flex-row gap-3 px-5 py-3.5 ${unread ? 'bg-surface' : 'bg-transparent'}`}
    >
      {unread ? (
        <View
          accessibilityLabel={fr.notifications.unreadLabel}
          className="absolute left-2 top-8 h-2 w-2 rounded-full bg-accent"
        />
      ) : null}

      <View className={`h-11 w-11 items-center justify-center rounded-xl ${bgClass}`}>
        <Icon name={style.icon} size={22} color={colors[style.inkToken]} filled={style.filled} />
      </View>

      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row justify-between gap-2">
          <Text
            variant="label"
            className={unread ? 'flex-1 font-body-extrabold' : 'flex-1 font-body-bold'}
            numberOfLines={2}
          >
            {notification.title}
          </Text>
          <Text variant="caption" tone="tertiary">
            {formatConversationTime(notification.at, now)}
          </Text>
        </View>
        <Text variant="body" tone="secondary">
          {notification.body}
        </Text>
        {notification.cta ? (
          <Text variant="caption" className="mt-0.5 font-body-extrabold text-primary">
            {notification.cta}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
