/**
 * Détection de connectivité réseau — capacité transverse de l'appareil, même famille que
 * useReduceMotion() ci-dessus : emplacement pensé pour une réutilisation par le Lot 7
 * (bannière hors-connexion globale) sans déplacement, mais l'USAGE reste strictement limité
 * à l'écran Chat pour ce lot-ci (approuvé explicitement — queryClient.ts et une bannière
 * globale restent prévus pour le Lot 7, non touchés ici).
 */
import { useNetInfo } from '@react-native-community/netinfo';

export function useIsConnected(): boolean {
  const { isConnected } = useNetInfo();
  return isConnected ?? true;
}
