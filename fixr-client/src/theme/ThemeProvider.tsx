/**
 * Applique la préférence d'apparence à NativeWind et au système.
 * MMKV étant synchrone, la préférence persistée est déjà disponible au premier rendu :
 * on l'applique au chargement du module pour éviter un flash de thème clair.
 */
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { colorScheme } from 'nativewind';
import { useEffect, type ReactNode } from 'react';

import { useThemeStore } from './store';
import { useTheme } from './useTheme';

colorScheme.set(useThemeStore.getState().preference);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useThemeStore((s) => s.preference);
  const { scheme, colors } = useTheme();

  useEffect(() => {
    colorScheme.set(preference);
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
