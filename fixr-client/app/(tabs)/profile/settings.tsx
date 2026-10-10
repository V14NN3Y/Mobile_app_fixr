/**
 * Paramètres — design/Settings.dc.html.
 */
import { router, Stack } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { ListGroup } from '@/components/ui/ListGroup';
import { ListRow } from '@/components/ui/ListRow';
import { Segmented } from '@/components/ui/Segmented';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useSessionStore } from '@/features/auth/store';
import { useHomeData } from '@/features/home/hooks';
import { useDeleteAccount } from '@/features/profile/hooks';
import { confirmBiometricUnlock, getBiometricAvailability } from '@/features/settings/biometrics';
import { DeleteAccountSheet, type DeleteAccountSheetRef } from '@/features/settings/components/DeleteAccountSheet';
import { LogoutSheet, type LogoutSheetRef } from '@/features/settings/components/LogoutSheet';
import { useSettingsStore, type NotificationPreferenceKey } from '@/features/settings/store';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

const NOTIFICATION_KEYS: NotificationPreferenceKey[] = ['missionUpdates', 'messages', 'smsBackup', 'promotions'];

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { colors, preference, setPreference } = useTheme();
  const t = fr.settings;
  const toast = useToast();

  const { notificationPreferences, biometricUnlockEnabled, setNotificationPreference, setBiometricUnlockEnabled } =
    useSettingsStore();
  const signOut = useSessionStore((s) => s.signOut);
  const homeQuery = useHomeData();
  const deleteAccountMutation = useDeleteAccount();

  const logoutSheetRef = useRef<LogoutSheetRef>(null);
  const deleteSheetRef = useRef<DeleteAccountSheetRef>(null);

  async function handleToggleBiometric(next: boolean) {
    if (!next) {
      setBiometricUnlockEnabled(false);
      return;
    }
    const availability = await getBiometricAvailability();
    if (!availability.hardware || !availability.enrolled) {
      toast.show(t.biometricUnavailable, { icon: null });
      return;
    }
    const confirmed = await confirmBiometricUnlock(t.rows.biometric.label);
    if (confirmed) setBiometricUnlockEnabled(true);
  }

  function showComingSoon() {
    toast.show(fr.common.comingSoon, { icon: null });
  }

  function handleDeleteAccount() {
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        deleteSheetRef.current?.dismiss();
        signOut();
      },
    });
  }

  const appearanceOptions = [
    { value: 'light' as const, label: t.appearance.light },
    { value: 'dark' as const, label: t.appearance.dark },
    { value: 'system' as const, label: t.appearance.system },
  ];
  const appearanceHelp = t.appearance.help[preference];

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="flex-row items-center gap-1.5 border-b border-border-subtle bg-bg px-2 pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel={t.backToProfile}
          className="h-11 w-11 items-center justify-center rounded-xl"
        >
          <Icon name="chevronLeft" size={22} color={colors.text} />
        </Pressable>
        <Text variant="title2" className="font-display">
          {t.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 22, paddingBottom: insets.bottom + 24 }}>
        <ListGroup title={t.sections.account}>
          <ListRow label={t.rows.personalInfo.label} subtitle={t.rows.personalInfo.subtitle} onPress={showComingSoon} />
          <ListRow label={t.rows.security.label} subtitle={t.rows.security.subtitle} onPress={showComingSoon} />
          <ListRow
            label={t.rows.biometric.label}
            subtitle={t.rows.biometric.subtitle}
            trailing={
              <Switch
                value={biometricUnlockEnabled}
                onValueChange={handleToggleBiometric}
                accessibilityLabel={t.rows.biometric.label}
              />
            }
            onPress={() => void handleToggleBiometric(!biometricUnlockEnabled)}
            accessibilityRole="switch"
            accessibilityState={{ checked: biometricUnlockEnabled }}
          />
          <ListRow label={t.rows.privacy.label} subtitle={t.rows.privacy.subtitle} onPress={showComingSoon} />
        </ListGroup>

        <ListGroup title={t.sections.notifications}>
          {NOTIFICATION_KEYS.map((key) => {
            const locked = key === 'missionUpdates';
            const value = locked ? true : notificationPreferences[key];
            return (
              <ListRow
                key={key}
                label={t.notificationPrefs[key].label}
                subtitle={t.notificationPrefs[key].help}
                dimmed={locked}
                trailing={
                  <Switch
                    value={value}
                    disabled={locked}
                    onValueChange={(v) => setNotificationPreference(key, v)}
                    accessibilityLabel={t.notificationPrefs[key].label}
                  />
                }
                onPress={locked ? undefined : () => setNotificationPreference(key, !value)}
                accessibilityRole="switch"
                accessibilityState={{ checked: value, disabled: locked }}
              />
            );
          })}
        </ListGroup>

        <ListGroup title={t.sections.preferences}>
          <ListRow label={t.rows.language.label} subtitle={t.rows.language.subtitle} onPress={showComingSoon} />
          <View className="gap-2.5 px-4 py-3.5">
            <Text variant="label" className="font-body-bold">
              {t.appearance.label}
            </Text>
            <Segmented options={appearanceOptions} value={preference} onChange={setPreference} />
            <Text variant="caption" tone="secondary">
              {appearanceHelp}
            </Text>
          </View>
        </ListGroup>

        <ListGroup title={t.sections.legal}>
          <ListRow label={t.rows.cgu} onPress={showComingSoon} />
          <ListRow label={t.rows.privacyPolicy} onPress={showComingSoon} />
        </ListGroup>

        <View className="gap-1">
          <Pressable
            onPress={() => logoutSheetRef.current?.present()}
            accessibilityRole="button"
            className="h-[52px] items-center justify-center rounded-2xl border border-border-subtle bg-surface"
          >
            <Text variant="label" className="font-body-extrabold">
              {t.logout.cta}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => deleteSheetRef.current?.present()}
            accessibilityRole="button"
            className="min-h-touch items-center justify-center"
          >
            <Text variant="caption" className="font-body-extrabold text-danger">
              {t.deleteAccount.cta}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <LogoutSheet
        ref={logoutSheetRef}
        activeMissionId={homeQuery.data?.activeMission?.booking.id ?? null}
        onConfirm={() => {
          logoutSheetRef.current?.dismiss();
          signOut();
        }}
        onKeep={() => logoutSheetRef.current?.dismiss()}
      />
      <DeleteAccountSheet
        ref={deleteSheetRef}
        loading={deleteAccountMutation.isPending}
        onConfirm={handleDeleteAccount}
        onCancel={() => deleteSheetRef.current?.dismiss()}
      />
    </View>
  );
}
