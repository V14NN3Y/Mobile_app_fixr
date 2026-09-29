/**
 * Écran provisoire du Lot 1 — titre + liens vers les écrans suivants du parcours.
 * Réutilisé par toutes les routes tant que leur contenu réel n'est pas construit
 * (Lots 2 à 7). Route affichée en petit, pour se repérer pendant la revue manuelle.
 */
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

export type ScreenPlaceholderLink = { label: string; href: Href };

export type ScreenPlaceholderProps = {
  /** Ex. « 01 · Bienvenue ». */
  title: string;
  /** Ex. « (auth)/welcome » — repère pendant la revue, pas affiché comme un titre. */
  route: string;
  /** Ex. « Lot 2 — design/Main.dc.html ». */
  description?: string;
  /** Écrans suivants du parcours (docs/ECRANS.md, design/Architecture.dc.html). */
  links?: ScreenPlaceholderLink[];
  /** Cas particuliers : bouton de connexion fictive, fermeture explicite, etc. */
  extra?: ReactNode;
};

export function ScreenPlaceholder({
  title,
  route,
  description,
  links,
  extra,
}: ScreenPlaceholderProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 20,
        gap: 16,
      }}
    >
      <View className="gap-1.5">
        <Text variant="title1">{title}</Text>
        <Text variant="caption" tone="tertiary" className="font-mono">
          {route}
        </Text>
        {description ? (
          <Text variant="body" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>

      {links && links.length > 0 ? (
        <View className="gap-2.5">
          {links.map((link) => (
            <Button
              key={link.label}
              variant="secondary"
              size="md"
              onPress={() => router.push(link.href)}
            >
              {link.label}
            </Button>
          ))}
        </View>
      ) : null}

      {extra}
    </ScrollView>
  );
}
