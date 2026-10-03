/**
 * Corps du pager d'onboarding — web. react-native-pager-view n'a aucune version web ;
 * cette variante affiche directement la slide courante (contrôlée par `page`, géré par le
 * parent), sans geste de balayage — web est une cible secondaire pour cette app
 * (CLAUDE.md). Voir le commentaire de OnboardingPager.tsx pour le détail du problème résolu.
 */
import { forwardRef, useImperativeHandle, type ReactNode } from 'react';
import { View } from 'react-native';

import { SlideIn } from './illustrations/motion-primitives';

export type OnboardingPagerRef = { goTo: (page: number) => void };

export type OnboardingPagerProps = {
  page: number;
  onPageChange: (page: number) => void;
  children: ReactNode[];
};

export const OnboardingPager = forwardRef<OnboardingPagerRef, OnboardingPagerProps>(
  function OnboardingPager({ page, onPageChange, children }, ref) {
    useImperativeHandle(ref, () => ({ goTo: onPageChange }));

    return (
      <SlideIn active key={page} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>{children[page]}</View>
      </SlideIn>
    );
  },
);
