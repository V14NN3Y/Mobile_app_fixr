/**
 * Lot 8, mode réel uniquement — répercute les événements onAuthStateChange de supabase-js
 * dans useSessionStore (src/features/auth/store.ts), pour que Stack.Protected
 * (app/_layout.tsx) continue d'arbitrer sur le même booléen qu'avant (`session !== null`),
 * sans jamais parler à Supabase directement. Monté une fois dans app/_layout.tsx.
 */
import { useEffect } from 'react';

import { USE_MOCKS } from '@/lib/env';
import { supabase } from '@/lib/supabase';

import { useSessionStore } from './store';

export function useSessionBridge(): void {
  const setSession = useSessionStore((s) => s.setSession);

  useEffect(() => {
    if (USE_MOCKS) return;

    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setSession(user ? { userId: user.id, phone: user.phone ?? '' } : null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setSession(user ? { userId: user.id, phone: user.phone ?? '' } : null);
    });

    return () => subscription.subscription.unsubscribe();
  }, [setSession]);
}
