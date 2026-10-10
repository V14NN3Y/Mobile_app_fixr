/**
 * Bannière hors-connexion globale (Lot 7) — motif calqué sur ToastProvider (Toast.tsx) :
 * une View englobant les enfants, puis une View sœur absolue `pointerEvents="box-none"`,
 * mais ancrée en haut (`top: insets.top`) plutôt qu'en bas. Pilotée par useIsConnected()
 * (src/lib/netinfo.ts, Lot 6), jusqu'ici seulement consommée par l'écran Chat. Montée une
 * fois dans app/_layout.tsx, au-dessus de toute la pile de navigation.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsConnected } from '@/lib/netinfo';
import { fr } from '@/lib/i18n/fr';

import { Banner } from './Banner';

export function OfflineBannerProvider({ children }: { children: ReactNode }) {
  const isConnected = useIsConnected();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      {children}
      {!isConnected ? (
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: insets.top }}>
          <Banner tone="offline">{fr.common.offlineBanner}</Banner>
        </View>
      ) : null}
    </View>
  );
}
