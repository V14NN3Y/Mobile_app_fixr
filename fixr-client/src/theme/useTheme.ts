/**
 * Accès au thème résolu.
 * `colors` est le SEUL point d'entrée pour ce que className ne peut pas styler :
 * stroke/fill SVG, ombres de tokens.elevation, interpolations Reanimated.
 * Pour tout le reste, utiliser les classes NativeWind (bg-surface, text-primary…).
 */
import { useColorScheme } from 'nativewind';

import { useThemeStore, type ThemePreference } from './store';
import { categoryTints, colors, type ColorScheme } from './tokens';

export function useTheme() {
  const { colorScheme } = useColorScheme();
  const scheme: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return {
    scheme,
    preference,
    setPreference,
    colors: colors[scheme],
    categoryTints: categoryTints[scheme],
  };
}

export type { ColorScheme, ThemePreference };
