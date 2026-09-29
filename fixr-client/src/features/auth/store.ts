/**
 * Session fictive — même pattern que src/theme/store.ts (zustand + persist + MMKV),
 * domaine auth. La vraie logique OTP (src/features/auth/api.ts) arrive au Lot 2 ;
 * ce store ne fait qu'exister/persister le fait d'être « connecté » ou non, pour que
 * Stack.Protected (app/_layout.tsx) puisse arbitrer (auth) vs (tabs).
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/lib/storage';

export type Session = {
  userId: string;
  phone: string;
};

type SessionState = {
  session: Session | null;
  signIn: (session: Session) => void;
  signOut: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      signIn: (session) => set({ session }),
      signOut: () => set({ session: null }),
    }),
    {
      name: 'fixr-session',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
