/**
 * Préférences de Paramètres (biométrie + notifications) — persistées par MMKV, même motif que
 * src/theme/store.ts (`useThemeStore`) et src/features/favorites/store.ts : des préférences
 * client pures, aucun aller-retour serveur avant le Lot 8 (Supabase). Un seul store pour les
 * deux familles de bascule, qui vivent sur le même écran et ne partagent de logique ni avec
 * le fil Notifications du Lot 6 ni avec la ressource Profil.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/lib/storage';

export type NotificationPreferenceKey = 'missionUpdates' | 'messages' | 'smsBackup' | 'promotions';

type SettingsState = {
  notificationPreferences: Record<NotificationPreferenceKey, boolean>;
  biometricUnlockEnabled: boolean;
  setNotificationPreference: (key: NotificationPreferenceKey, value: boolean) => void;
  setBiometricUnlockEnabled: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationPreferences: { missionUpdates: true, messages: true, smsBackup: true, promotions: false },
      biometricUnlockEnabled: false,
      setNotificationPreference: (key, value) =>
        set((s) => ({ notificationPreferences: { ...s.notificationPreferences, [key]: value } })),
      setBiometricUnlockEnabled: (value) => set({ biometricUnlockEnabled: value }),
    }),
    {
      name: 'fixr-settings',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
