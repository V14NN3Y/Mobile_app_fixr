/**
 * Pagination d'onboarding — design/Onboarding1/2/3.dc.html.
 * À venir : rond 6×6 border-strong. Actif : pilule 28×6 primary. Déjà vu : rond 6×6
 * primary (même couleur que l'actif, forme différente — pas de bordure grise une fois passé).
 */
import { View } from 'react-native';

import { cn } from '@/lib/cn';

export type PageDotsProps = {
  count: number;
  activeIndex: number;
  testID?: string;
};

export function PageDots({ count, activeIndex, testID }: PageDotsProps) {
  return (
    <View
      testID={testID}
      className="flex-row items-center gap-1.5"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: count, now: activeIndex + 1 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className={cn(
            'h-1.5 rounded-[3px]',
            i === activeIndex
              ? 'w-7 bg-primary'
              : i < activeIndex
                ? 'w-1.5 bg-primary'
                : 'w-1.5 bg-border-strong',
          )}
        />
      ))}
    </View>
  );
}
