/**
 * Ligne de liste — design/Profile.dc.html (`.it`/`.ic`, icône carrée) + Settings.dc.html
 * (`.it` sans icône). `trailing` par défaut au chevron si `onPress` est fourni ; passer un
 * nœud (Switch, Badge) pour les lignes à bascule/compteur. Les bascules plein-format relient
 * le même handler à `onPress` et au `onValueChange` du Switch passé en `trailing` — pas de
 * Pressable imbriqué, Switch n'en porte pas.
 */
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ListRowProps = {
  icon?: IconName;
  label: string;
  subtitle?: string;
  trailing?: 'chevron' | ReactNode;
  /** Ligne verrouillée (« Suivi des missions ») : opacité .6 sur toute la ligne, pas
   * seulement sur le Switch passé en trailing. */
  dimmed?: boolean;
  onPress?: () => void;
  accessibilityRole?: 'button' | 'switch';
  accessibilityState?: { checked?: boolean; disabled?: boolean };
  testID?: string;
};

export function ListRow({
  icon,
  label,
  subtitle,
  trailing = 'chevron',
  dimmed = false,
  onPress,
  accessibilityRole = 'button',
  accessibilityState,
  testID,
}: ListRowProps) {
  const { colors } = useTheme();

  const content = (
    <View className="min-h-[58px] flex-row items-center gap-3.5 px-4 py-2" style={dimmed ? { opacity: 0.6 } : undefined}>
      {icon ? (
        <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-surface-muted">
          <Icon name={icon} size={20} color={colors.text} />
        </View>
      ) : null}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="label" className="font-body-bold" numberOfLines={1}>
          {label}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing === 'chevron' ? (
        onPress ? <Icon name="chevronRight" size={18} color={colors.textTertiary} /> : null
      ) : (
        trailing
      )}
    </View>
  );

  if (!onPress) return <View testID={testID}>{content}</View>;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
    >
      {content}
    </Pressable>
  );
}
