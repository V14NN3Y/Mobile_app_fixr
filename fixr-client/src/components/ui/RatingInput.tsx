/**
 * Notation — design/Components.dc.html « Notation » (étoiles 40 px, remplies/vides).
 * Étoile à deux états (remplie / vide + contour) : rendu direct en SVG, l'Icon générique
 * (fill xor stroke) ne couvre pas le contour fin des étoiles vides de la maquette.
 */
import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/useTheme';

import { Text } from './Text';

const STAR_PATH = 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z';

function Star({
  size,
  filled,
  color,
  emptyFill,
  emptyStroke,
}: {
  size: number;
  filled: boolean;
  color: string;
  emptyFill: string;
  emptyStroke: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={STAR_PATH}
        fill={filled ? color : emptyFill}
        stroke={filled ? 'none' : emptyStroke}
        strokeWidth={filled ? 0 : 1.2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export type RatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  label?: string;
  disabled?: boolean;
  testID?: string;
};

/** 5 étoiles interactives, 40 px par défaut. */
export function RatingInput({
  value,
  onChange,
  size = 40,
  label,
  disabled = false,
  testID,
}: RatingInputProps) {
  const { colors } = useTheme();

  return (
    <View testID={testID} className="gap-2">
      <View accessibilityRole="adjustable" className="flex-row gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            disabled={disabled}
            hitSlop={size < 44 ? (44 - size) / 2 : 0}
            onPress={() => {
              if (disabled) return;
              void Haptics.selectionAsync();
              onChange(n);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${n} étoile${n > 1 ? 's' : ''}`}
            accessibilityState={{ selected: n <= value }}
          >
            <Star
              size={size}
              filled={n <= value}
              color={colors.rating}
              emptyFill={colors.surface}
              emptyStroke={colors.borderStrong}
            />
          </Pressable>
        ))}
      </View>
      {label ? (
        <Text variant="bodyLg" className="font-body-bold">
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export type RatingDisplayProps = {
  value: number;
  size?: number;
  testID?: string;
};

/** Rangée d'étoiles en lecture seule (ex. « Ponctualité ★★★★★ »). */
export function RatingDisplay({ value, size = 16, testID }: RatingDisplayProps) {
  const { colors } = useTheme();
  const rounded = Math.round(value);

  return (
    <View
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={`${rounded} sur 5 étoiles`}
      className="flex-row gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          filled={n <= rounded}
          color={colors.rating}
          emptyFill={colors.surface}
          emptyStroke={colors.border}
        />
      ))}
    </View>
  );
}
