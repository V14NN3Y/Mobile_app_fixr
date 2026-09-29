/**
 * Barre d'onglets custom — design/Components.dc.html « Barre de navigation »
 * (hauteur 54 + safe area, onglet actif pétrole + icône pleine + repère 3 px, badge terre
 * cuite). Construite avec expo-router/ui (Tabs/TabSlot/TabList/TabTrigger, headless) posé
 * dans app/(tabs)/_layout.tsx — pas le `Tabs` classique de expo-router (déprécié) ni
 * unstable-native-tabs (rendu natif du système, pas fidèle à la maquette).
 *
 * <TabList> doit être un enfant DIRECT de <Tabs> (vérifié dans le code source d'expo-router :
 * Tabs.js#parseTriggersFromChildren ne descend que dans les Fragment et les éléments dont
 * `type === TabList` — tout composant custom qui l'envelopperait le rendrait invisible à la
 * découverte des routes, d'où l'erreur « Couldn't find any screens for the navigator »
 * rencontrée en testant). Ce fichier n'exporte donc que les morceaux réutilisables
 * (TabBarButton, useHideTabBar) ; app/(tabs)/_layout.tsx compose <TabList> lui-même.
 *
 * Masquage : uniquement bookings/[id]/live et messages/[threadId] (les autres écrans à
 * masquer — request/*, artisan/[id], filters, notifications — sont hors du groupe (tabs),
 * donc n'ont structurellement jamais cette barre).
 */
import { usePathname } from 'expo-router';
import type { TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';

import { useTheme } from '@/theme/useTheme';

import { Badge } from '../ui/Badge';
import { Icon, type IconName } from '../ui/Icon';
import { Text } from '../ui/Text';

export function useHideTabBar(): boolean {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  return (
    (parts[0] === 'bookings' && parts[2] === 'live') ||
    (parts[0] === 'messages' && parts.length === 2)
  );
}

export type TabBarButtonProps = PressableProps &
  TabTriggerSlotProps & {
    icon: IconName;
    label: string;
    /** Compteur factice ce lot-ci — à remplacer par de vraies données aux Lots 5/6. */
    badge?: number;
  };

export const TabBarButton = forwardRef<View, TabBarButtonProps>(function TabBarButton(
  { icon, label, badge, isFocused, ...pressableProps },
  ref,
) {
  const { colors } = useTheme();
  const color = isFocused ? colors.primary : colors.textTertiary;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="tab"
      accessibilityState={{ selected: Boolean(isFocused) }}
      accessibilityLabel={label}
      className="min-h-touch flex-1 items-center justify-center gap-1 pt-2.5"
      {...pressableProps}
    >
      {isFocused ? (
        <View className="absolute top-0 h-[3px] w-7 rounded-b-[3px] bg-primary" />
      ) : null}
      <View>
        <Icon name={icon} color={color} filled={isFocused} size={24} />
        {badge && badge > 0 ? (
          <View className="absolute -right-2 -top-1">
            <Badge mode="count" value={badge} />
          </View>
        ) : null}
      </View>
      <Text
        variant="micro"
        tone="inherit"
        style={{ color }}
        className="font-body-bold normal-case tracking-normal"
      >
        {label}
      </Text>
    </Pressable>
  );
});
