/**
 * Bouton retour d'en-tête — design/Main.dc.html, Login.dc.html, Otp.dc.html, etc.
 * (classe `.ib`, 44×44, radius 14). Utilise router.back() par défaut ; `onPress` pour
 * un comportement différent (ex. Otp « Modifier » revient toujours à Login, pas juste back).
 */
import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

export type BackButtonProps = {
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function BackButton({ onPress, accessibilityLabel }: BackButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? fr.auth.common.back}
      hitSlop={4}
      className="h-11 w-11 items-center justify-center rounded-lg active:bg-surface-muted"
    >
      <Icon name="chevronLeft" size={22} color={colors.text} />
    </Pressable>
  );
}
