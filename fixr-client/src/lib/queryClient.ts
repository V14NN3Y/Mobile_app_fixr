/**
 * Client React Query partagé — branché dans app/_layout.tsx.
 * Lot 7 : bannière hors-connexion globale (src/components/ui/OfflineBanner.tsx) + NetInfo
 * (src/lib/netinfo.ts, Lot 6) — refetchOnReconnect réactivé, les requêtes se rafraîchissent
 * désormais au retour du réseau.
 *
 * `onlineManager` (React Query) n'écoute par défaut QUE `window.addEventListener('online')`
 * (vérifié dans le code source) : un défaut web, qui ne se déclenche jamais sur natif. Sans
 * ce branchement explicite sur NetInfo, refetchOnReconnect serait un no-op silencieux sur
 * Android/iOS (React Query se considérerait toujours « en ligne »).
 *
 * `networkMode: 'always'` en défaut global — pas seulement sur les mutations de messages
 * (Lot 6) : constaté en testant un écran jamais encore visité pendant une coupure simulée
 * (Playwright `context.setOffline`), avec networkMode par défaut ('online'), une requête
 * sans cache reste « paused » (isFetching=false, isPending=true) tant que hors connexion —
 * donc isLoading (= isPending && isFetching) devient faux et l'écran tombe dans sa branche
 * d'erreur (`!data`) au lieu de rester en chargement, affichant à tort « Impossible de
 * charger » + un bouton Réessayer inutile, empilé sous la bannière hors-connexion qui vient
 * d'être ajoutée. Aucune requête de cette app n'appelle jamais de vrai réseau
 * (simulateRequest est un minuteur local) : rien ne justifie qu'une seule soit mise en
 * pause par ce mécanisme, device entier ou pas.
 */
import NetInfo from '@react-native-community/netinfo';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => setOnline(state.isConnected ?? true));
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnReconnect: true,
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});
