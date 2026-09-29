/**
 * Applique la préférence d'apparence (Clair / Sombre / Système) à NativeWind et au système.
 *
 * tailwind.config.js déclare darkMode: 'class' (requis pour piloter le thème depuis le JS —
 * voir scripts/generate-theme.mjs) : colorScheme.set() bascule alors une classe `.dark` sur
 * l'élément racine, jamais la media query seule. Mais colorScheme.set('system') se contente
 * de RETIRER cette classe (voir react-native-css-interop/runtime/web/color-scheme.ts) — il
 * ne la rajoute jamais tout seul selon l'OS. Pour que « Système » suive réellement l'apparence
 * du téléphone/navigateur, on résout nous-mêmes la préférence 'system' en 'light'|'dark' via
 * Appearance, et on réagit à ses changements tant que 'system' est sélectionné.
 *
 * Sur web, ce module est aussi évalué côté serveur (rendu SSR de la page initiale) : à ce
 * moment `window` n'existe pas. On n'y touche à rien côté NativeWind/Appearance — la classe
 * .dark sera posée côté client, au montage, avant peinture (effet ci-dessous).
 */
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { colorScheme } from 'nativewind';
import { useEffect, type ReactNode } from 'react';
import { Appearance, Platform } from 'react-native';

import { useThemeStore, type ThemePreference } from './store';
import { useTheme } from './useTheme';

const isWebServer = Platform.OS === 'web' && typeof window === 'undefined';

function resolveScheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'system') {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

if (!isWebServer) {
  colorScheme.set(resolveScheme(useThemeStore.getState().preference));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useThemeStore((s) => s.preference);
  const { scheme, colors } = useTheme();

  useEffect(() => {
    colorScheme.set(resolveScheme(preference));

    if (preference !== 'system') return;

    // Suit les changements d'apparence du système tant que « Système » est sélectionné.
    const sub = Appearance.addChangeListener(({ colorScheme: osScheme }) => {
      colorScheme.set(osScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, [preference]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.bg);
  }, [colors.bg]);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </>
  );
}
