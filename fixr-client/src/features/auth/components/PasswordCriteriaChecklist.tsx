/**
 * Checklist des critères de mot de passe — design/SignupErrors.dc.html (grille 2 colonnes,
 * icône ✓ verte / ✗ rouge). Alimentée par src/features/auth/password.ts (source unique avec
 * PasswordStrengthMeter et la validation zod). Grille 2×2 explicite (pas de calc() — non
 * garanti par NativeWind sur toutes les plateformes) puisque les critères sont toujours 4.
 */
import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { getPasswordCriteria, type PasswordCriterion } from '@/features/auth/password';
import { useTheme } from '@/theme/useTheme';

export type PasswordCriteriaChecklistProps = {
  password: string;
  testID?: string;
};

function CriterionItem({ criterion }: { criterion: PasswordCriterion }) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 flex-row items-center gap-1.5">
      <Icon
        name={criterion.met ? 'check' : 'close'}
        size={14}
        color={criterion.met ? colors.success : colors.danger}
      />
      <Text
        variant="caption"
        className="font-body-bold"
        style={{ color: criterion.met ? colors.successInk : colors.danger }}
      >
        {criterion.label}
      </Text>
    </View>
  );
}

export function PasswordCriteriaChecklist({ password, testID }: PasswordCriteriaChecklistProps) {
  const [length, uppercase, digit, symbol] = getPasswordCriteria(password);

  return (
    <View testID={testID} className="gap-1.5">
      <View className="flex-row gap-4">
        <CriterionItem criterion={digit} />
        <CriterionItem criterion={length} />
      </View>
      <View className="flex-row gap-4">
        <CriterionItem criterion={uppercase} />
        <CriterionItem criterion={symbol} />
      </View>
    </View>
  );
}
