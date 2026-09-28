/**
 * Stockage local synchrone (MMKV v4 / Nitro) et adaptateur pour zustand/persist.
 * MMKV contient du code natif : il faut un dev build (`npx expo run:android`),
 * il ne fonctionne pas dans Expo Go.
 */
import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const storage = createMMKV({ id: 'fixr' });

export const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => {
    storage.remove(name);
  },
};
