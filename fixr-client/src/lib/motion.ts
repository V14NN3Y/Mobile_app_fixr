/**
 * Détection de « Réduire les animations » (accessibilité), avec suivi des changements
 * en direct — CLAUDE.md : toute animation en boucle doit s'arrêter (fondu simple, pas de
 * boucle) si l'utilisateur l'a activé, y compris s'il l'active pendant que l'écran est
 * ouvert. Source unique pour tout le nouveau code du Lot 2 (motion-primitives.tsx) ;
 * Skeleton.tsx/Spinner.tsx gardent leur propre détection existante (lecture unique au
 * montage, non retouchée dans ce lot).
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (!cancelled) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
      if (!cancelled) setReduceMotion(v);
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return reduceMotion;
}
