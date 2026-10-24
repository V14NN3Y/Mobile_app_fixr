/**
 * Session — forme PUBLIQUE inchangée depuis le Lot 1 ({userId, phone} | null, signIn/
 * signOut), pour que les 4 points d'appel existants (login.tsx, verify-otp.tsx,
 * settings.tsx, app/_layout.tsx) n'aient rien à changer. En mode mock : persistée
 * directement (comme avant). En mode réel (Lot 8) : PAS de middleware persist ici — le
 * client Supabase persiste déjà la vraie session (src/lib/supabaseStorage.ts) ; ce store
 * devient un simple miroir, synchronisé par useSessionBridge() (sessionBridge.ts, monté une
 * fois dans app/_layout.tsx) via supabase.auth.onAuthStateChange.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { USE_MOCKS } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { mmkvStorage } from '@/lib/storage';

export type Session = {
  userId: string;
  phone: string;
};

type SessionState = {
  session: Session | null;
  signIn: (session: Session) => void;
  signOut: () => void;
  /** Usage interne à sessionBridge.ts — pas pour les écrans. */
  setSession: (session: Session | null) => void;
};

function signOutAction(set: (partial: Partial<SessionState>) => void) {
  return () => {
    // Optimiste : l'UI bascule immédiatement, qu'il y ait réseau ou non (comme en mode
    // mock) ; la vraie session Supabase est invalidée en arrière-plan.
    set({ session: null });
    if (!USE_MOCKS) void supabase.auth.signOut();
  };
}

export const useSessionStore = USE_MOCKS
  ? create<SessionState>()(
      persist(
        (set) => ({
          session: null,
          signIn: (session) => set({ session }),
          signOut: signOutAction(set),
          setSession: (session) => set({ session }),
        }),
        {
          name: 'fixr-session',
          storage: createJSONStorage(() => mmkvStorage),
        },
      ),
    )
  : create<SessionState>()((set) => ({
      session: null,
      // signIn() en mode réel n'a rien à faire : useSessionBridge() a déjà répercuté le
      // même état via onAuthStateChange, qui se déclenche AVANT que l'écran n'appelle
      // signIn() (voir verify-otp.tsx : le bouton "Continuer" vient après). Gardé pour ne
      // pas changer la signature publique ni les 4 points d'appel.
      signIn: () => {},
      signOut: signOutAction(set),
      setSession: (session) => set({ session }),
    }));
