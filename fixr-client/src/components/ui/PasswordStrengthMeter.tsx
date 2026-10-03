/**
 * Indicateur de force du mot de passe — design/Signup.dc.html (4 barres + libellé).
 * `score` : 0 à 4 critères respectés (src/features/auth/password.ts).
 */
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export type PasswordStrengthMeterProps = {
  score: number; // 0..4
  label: string; // « Faible » / « Moyenne » / « Solide »
  testID?: string;
};

export function PasswordStrengthMeter({ score, label, testID }: PasswordStrengthMeterProps) {
  return (
    <View testID={testID} className="gap-1.5">
      <View className="flex-row gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            className={cn('h-1 flex-1 rounded-full', i < score ? 'bg-success' : 'bg-border')}
          />
        ))}
      </View>
      {score > 0 ? (
        <Text variant="caption" className="font-body-bold text-success-ink">
          {label}
        </Text>
      ) : null}
    </View>
  );
}
