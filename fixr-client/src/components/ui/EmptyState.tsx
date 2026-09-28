/**
 * État vide — design/Components.dc.html « Skeletons & état vide ».
 * Titre 16 px gras Manrope : hors des 9 variantes de <Text> (label est le plus proche,
 * ajusté en taille), comme pour Button/Badge.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type EmptyStateAction = { label: string; onPress: () => void };

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  children?: ReactNode;
  testID?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  testID,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View testID={testID} className="items-center gap-2 px-5 py-2.5">
      <View className="h-16 w-16 items-center justify-center rounded-xl bg-primary-soft">
        <Icon name={icon} size={30} color={colors.primary} />
      </View>
      <Text variant="label" className="text-center" style={{ fontSize: 16, lineHeight: 22 }}>
        {title}
      </Text>
      {description ? (
        <Text variant="caption" tone="secondary" className="text-center">
          {description}
        </Text>
      ) : null}
      {action ? (
        <Button variant="primary" size="md" onPress={action.onPress} className="mt-1.5">
          {action.label}
        </Button>
      ) : null}
      {children}
    </View>
  );
}
