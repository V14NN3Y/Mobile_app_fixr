/**
 * Notifications — design/Notifications.dc.html. Route racine, hors (tabs)
 * (design/Architecture.dc.html).
 */
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationRow } from '@/components/domain';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { groupNotificationsByDate } from '@/features/notifications/grouping';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/features/notifications/hooks';
import {
  DEMO_NOTIFICATIONS_BY_TYPE,
  getNotificationPermissionStatus,
  registerPushTokenIfPossible,
  requestNotificationPermission,
  scheduleDemoNotification,
} from '@/features/notifications/push';
import { resolveDeepLink } from '@/lib/deepLink';
import { fr } from '@/lib/i18n/fr';
import { NOW } from '@/mocks/data';
import { useTheme } from '@/theme/useTheme';

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.notifications;
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [promptDismissed, setPromptDismissed] = useState(false);

  const notificationsQuery = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  useEffect(() => {
    void getNotificationPermissionStatus().then(setPermissionStatus);
  }, []);

  async function handleEnableNotifications() {
    const status = await requestNotificationPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      void registerPushTokenIfPossible();
      const demo = DEMO_NOTIFICATIONS_BY_TYPE.on_the_way;
      void scheduleDemoNotification(demo.title, demo.body, demo.deepLink);
    }
  }

  function handlePressNotification(id: string, deepLink: string) {
    markReadMutation.mutate(id);
    const href = resolveDeepLink(deepLink);
    if (href) router.push(href);
  }

  if (notificationsQuery.isLoading) {
    return (
      <View className="flex-1 bg-bg px-5" style={{ paddingTop: insets.top + 16 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Skeleton height={300} rounded={20} />
      </View>
    );
  }

  if (notificationsQuery.isError || !notificationsQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-5" style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Banner tone="error">{t.error.title}</Banner>
        <Button variant="primary" onPress={() => notificationsQuery.refetch()}>
          {t.error.retry}
        </Button>
      </View>
    );
  }

  // Ancré sur le NOW figé des mocks — même raison que le Chat : les fixtures doivent rester
  // groupées sous « Aujourd'hui »/« Hier »/« Cette semaine » quel que soit le jour réel où
  // la session tourne.
  const now = new Date(NOW);
  const notifications = notificationsQuery.data;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = unreadOnly ? notifications.filter((n) => !n.read) : notifications;
  const groups = groupNotificationsByDate(filtered, now);
  const showPermissionPrompt = permissionStatus === 'undetermined' && !promptDismissed;

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="gap-3 border-b border-border-subtle bg-bg px-3"
        style={{ paddingTop: insets.top + 10, paddingBottom: 10 }}
      >
        <View className="flex-row items-center justify-between px-2">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={fr.messages.chat.backLabel}
            className="h-11 w-11 items-center justify-center rounded-xl"
          >
            <Icon name="chevronLeft" size={22} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/profile/settings')}
            accessibilityRole="button"
            accessibilityLabel={t.settingsLabel}
            className="h-11 w-11 items-center justify-center rounded-xl"
          >
            <Icon name="sliders" size={20} color={colors.text} />
          </Pressable>
        </View>
        <View className="flex-row items-center justify-between px-2.5">
          <Text variant="title1" className="font-display">
            {t.title}
          </Text>
          {unreadCount > 0 ? (
            <Pressable
              onPress={() => markAllReadMutation.mutate()}
              accessibilityRole="button"
              className="min-h-touch items-center justify-center"
            >
              <Text variant="label" className="font-body-extrabold text-primary">
                {t.markAllRead}
              </Text>
            </Pressable>
          ) : null}
        </View>
        <View className="flex-row gap-2 px-2.5">
          <Chip variant={!unreadOnly ? 'selected' : 'default'} onPress={() => setUnreadOnly(false)}>
            {t.tabAll}
          </Chip>
          <Chip variant={unreadOnly ? 'selected' : 'default'} onPress={() => setUnreadOnly(true)}>
            {t.unreadChip(unreadCount)}
          </Chip>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {showPermissionPrompt ? (
          <View className="mx-5 mt-4 gap-2.5 rounded-2xl border border-border-subtle bg-surface p-4">
            <Text variant="label" className="font-body-extrabold">
              {t.permissionPrompt.title}
            </Text>
            <Text variant="caption" tone="secondary">
              {t.permissionPrompt.description}
            </Text>
            <View className="flex-row gap-2">
              <Button variant="primary" size="sm" className="flex-1" onPress={handleEnableNotifications}>
                {t.permissionPrompt.cta}
              </Button>
              <Button variant="tertiary" size="sm" onPress={() => setPromptDismissed(true)}>
                {t.permissionPrompt.dismiss}
              </Button>
            </View>
          </View>
        ) : null}

        {__DEV__ ? (
          <View className="mx-5 mt-4 gap-2.5 rounded-2xl border border-border-subtle bg-surface p-4">
            <Text variant="label" className="font-body-extrabold">
              {t.devTest.title}
            </Text>
            <Text variant="caption" tone="secondary">
              {t.devTest.hint}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {Object.entries(DEMO_NOTIFICATIONS_BY_TYPE).map(([type, demo]) => (
                <Chip key={type} onPress={() => void scheduleDemoNotification(demo.title, demo.body, demo.deepLink)}>
                  {type}
                </Chip>
              ))}
            </View>
          </View>
        ) : null}

        {groups.length === 0 ? (
          <EmptyState
            icon="bellCheck"
            title={t.emptyTitle}
            description={t.emptyDescription}
            action={unreadOnly ? { label: t.emptyReset, onPress: () => setUnreadOnly(false) } : undefined}
          />
        ) : (
          groups.map((group) => (
            <View key={group.label}>
              <Text
                variant="micro"
                tone="tertiary"
                className="px-5 pb-2 pt-4 tracking-wide"
              >
                {group.label}
              </Text>
              {group.items.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  now={now}
                  onPress={() => handlePressNotification(notification.id, notification.deepLink)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
