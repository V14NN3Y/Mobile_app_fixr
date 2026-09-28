/**
 * Avatar — design/Components.dc.html « Badges & avatars ».
 * Initiales sur fond teinté. La maquette réutilise la palette des 8 teintes de catégorie
 * (tokens.categoryTints) comme jeu de couleurs pour les avatars de personnes — pas de lien
 * sémantique avec le métier de l'artisan ; choisie par un hachage déterministe de `seed`.
 */
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { type CategoryId } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Text } from './Text';

export type AvatarSize = 72 | 56 | 52 | 46 | 40 | 32;

const fontSizeFor: Record<AvatarSize, number> = { 72: 24, 56: 18, 52: 16, 46: 15, 40: 13, 32: 11 };

const tintOrder: CategoryId[] = [
  'plomberie',
  'electricite',
  'climatisation',
  'peinture',
  'menuiserie',
  'serrurerie',
  'nettoyage',
  'reparation',
];

function tintFor(seed: string): CategoryId {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return tintOrder[h % tintOrder.length]!;
}

export type AvatarProps = {
  initials: string;
  seed?: string;
  size?: AvatarSize;
  /** Pastille « en ligne » (design/Components.dc.html, avatar 52 px). */
  online?: boolean;
  /** Bordure claire pour la pile (AvatarStack) : cercle plus épais autour de l'avatar. */
  stacked?: boolean;
  testID?: string;
};

export function Avatar({ initials, seed, size = 52, online = false, stacked = false, testID }: AvatarProps) {
  const { categoryTints } = useTheme();
  const tint = categoryTints[tintFor(seed ?? initials)];

  return (
    <View testID={testID} style={{ width: size, height: size }} className="relative">
      <View
        className={cn('h-full w-full items-center justify-center rounded-full', stacked && 'border-2 border-surface')}
        style={{ backgroundColor: tint.bg }}
      >
        <Text
          tone="inherit"
          className="font-body-extrabold"
          style={{ color: tint.ink, fontSize: fontSizeFor[size], lineHeight: fontSizeFor[size] + 2 }}
        >
          {initials}
        </Text>
      </View>
      {online ? (
        <View
          className="absolute bottom-0 right-0 rounded-full border-[2.5px] border-surface bg-online"
          style={{ width: 14, height: 14 }}
        />
      ) : null}
    </View>
  );
}

export type AvatarStackItem = { initials: string; seed?: string };

export type AvatarStackProps = {
  items: AvatarStackItem[];
  size?: AvatarSize;
  /** Nombre max affiché avant la pastille +N. */
  max?: number;
  testID?: string;
};

/** Pile d'avatars chevauchés (−8 px), avec pastille « +N » (design/Components.dc.html). */
export function AvatarStack({ items, size = 32, max = 3, testID }: AvatarStackProps) {
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;

  return (
    <View testID={testID} className="flex-row">
      {visible.map((item, i) => (
        <View key={i} style={i > 0 ? { marginLeft: -8 } : undefined}>
          <Avatar initials={item.initials} seed={item.seed} size={size} stacked />
        </View>
      ))}
      {overflow > 0 ? (
        <View
          style={{ width: size, height: size, marginLeft: -8 }}
          className="items-center justify-center rounded-full border-2 border-surface bg-surface-muted"
        >
          <Text
            tone="default"
            className="font-body-extrabold"
            style={{ fontSize: fontSizeFor[size], lineHeight: fontSizeFor[size] + 2 }}
          >
            +{overflow}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
