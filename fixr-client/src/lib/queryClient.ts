/**
 * Client React Query partagé — branché dans app/_layout.tsx.
 * Pas de vrai réseau à surveiller avant le Lot 7 (NetInfo, bannière hors connexion) :
 * refetchOnReconnect désactivé jusque-là.
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnReconnect: false,
    },
  },
});
