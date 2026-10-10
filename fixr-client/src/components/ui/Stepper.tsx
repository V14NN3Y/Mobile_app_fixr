/**
 * Repère d'étapes — design/Components.dc.html « Progression › Étapes de demande ».
 * N colonnes, barre 4 px ; étape courante en gras primary, faites en secondary, à venir en tertiary.
 * Taille 12 px absente des 9 variantes (label=14) : ajustée comme Button/Badge/EmptyState.
 */
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export type StepperProps = {
  steps: readonly string[];
  /** Index (0-based) de l'étape en cours. */
  currentIndex: number;
  testID?: string;
};

export function Stepper({ steps, currentIndex, testID }: StepperProps) {
  return (
    <View testID={testID} accessibilityRole="progressbar" className="flex-row gap-1.5">
      {steps.map((label, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <View key={i} className="flex-1 gap-1.5">
            <View
              className={cn('h-1 rounded-full', done || current ? 'bg-primary' : 'bg-border')}
            />
            <Text
              variant="label"
              tone={current ? 'default' : done ? 'secondary' : 'tertiary'}
              className={cn('font-body-bold', current && 'font-body-extrabold text-primary')}
              style={{ fontSize: 12, lineHeight: 15 }}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
