/**
 * Corps du pager d'onboarding — natif (react-native-pager-view, swipe + Suivant/retour
 * pilotés depuis l'extérieur). Variante web séparée (OnboardingPager.web.tsx) : ce paquet
 * n'a AUCUNE version web (pas de .web.js dans node_modules/react-native-pager-view — vérifié,
 * pas supposé) et casse tout le bundle web s'il est importé, même conditionnellement, depuis
 * un fichier de route — la résolution .web.tsx ne s'applique pas au require.context
 * d'Expo Router (constaté en testant un rendu web réel), seulement aux imports ordinaires
 * comme celui-ci. Isoler PagerView ici, hors de app/, est donc nécessaire, pas cosmétique.
 */
import { forwardRef, useImperativeHandle, useRef, type ReactNode } from 'react';
import PagerView from 'react-native-pager-view';

export type OnboardingPagerRef = { goTo: (page: number) => void };

export type OnboardingPagerProps = {
  /** Non utilisé ici : PagerView gère son état visuel lui-même (swipe + goTo() impératif).
   *  Présent uniquement pour une interface identique à la variante web (contrôlée). */
  page: number;
  onPageChange: (page: number) => void;
  children: ReactNode[];
};

export const OnboardingPager = forwardRef<OnboardingPagerRef, OnboardingPagerProps>(
  function OnboardingPager({ onPageChange, children }, ref) {
    const pagerRef = useRef<PagerView>(null);

    useImperativeHandle(ref, () => ({
      goTo: (page) => pagerRef.current?.setPage(page),
    }));

    return (
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => onPageChange(e.nativeEvent.position)}
      >
        {children}
      </PagerView>
    );
  },
);
