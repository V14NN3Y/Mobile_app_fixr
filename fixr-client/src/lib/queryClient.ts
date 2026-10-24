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
 * `networkMode: 'always'` en défaut global en mode MOCK uniquement — pas seulement sur les
 * mutations de messages (Lot 6) : constaté en testant un écran jamais encore visité pendant
 * une coupure simulée (Playwright `context.setOffline`), avec networkMode par défaut
 * ('online'), une requête sans cache reste « paused » (isFetching=false, isPending=true)
 * tant que hors connexion — donc isLoading (= isPending && isFetching) devient faux et
 * l'écran tombe dans sa branche d'erreur (`!data`) au lieu de rester en chargement. Aucune
 * requête ne fait de vrai réseau en mode mock (simulateRequest est un minuteur local) : rien
 * ne justifie qu'une seule soit mise en pause par ce mécanisme.
 *
 * Lot 8 (mode réel) : repasse sur le défaut React Query ('online') — ici, de vraies requêtes
 * existent, et 'always' les ferait toutes retenter en boucle hors connexion au lieu de les
 * mettre en pause proprement jusqu'au retour du réseau (refetchOnReconnect reprend alors le
 * relais, via le branchement NetInfo ci-dessous).
 */
import NetInfo from '@react-native-community/netinfo';
import { onlineManager, QueryCache, QueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

import { USE_MOCKS } from './env';
import { Sentry, SENTRY_ENABLED } from './sentry';

if (Platform.OS !== 'web') {
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => setOnline(state.isConnected ?? true));
  });
}

export const queryClient = new QueryClient({
  // Lot 8 : React Query n'affiche par défaut aucune erreur en console — un écran montre
  // juste son message générique ("Impossible de charger…"), sans rien dans les DevTools.
  // Repéré en diagnostiquant un vrai bug (TypeError silencieuse dans une queryFn) où ce
  // log a fait toute la différence ; gardé en permanence (dev seulement, __DEV__) plutôt
  // que retiré après coup. Lot 9 : relaie aussi vers Sentry (production incluse — c'est là
  // que ça compte le plus), sans condition __DEV__ pour cette partie.
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (__DEV__) console.error('[queryCache error]', JSON.stringify(query.queryKey), error);
      if (SENTRY_ENABLED) Sentry.captureException(error, { extra: { queryKey: query.queryKey } });
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnReconnect: true,
      networkMode: USE_MOCKS ? 'always' : 'online',
    },
    mutations: {
      networkMode: USE_MOCKS ? 'always' : 'online',
    },
  },
});
