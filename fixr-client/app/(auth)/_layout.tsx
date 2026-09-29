/**
 * Pile non connectée — affichée tant qu'aucune session n'existe (design/Architecture.dc.html).
 * Chaque écran affiche son propre en-tête natif (titre + retour), posé via
 * <Stack.Screen options={{ title }} /> dans chaque fichier de route.
 *
 * Pas de (auth)/index.tsx : sans initialRouteName, Expo Router choisit un écran par défaut
 * arbitraire (constaté en testant un rendu réel : « login », probablement le premier
 * fichier par ordre alphabétique) au lieu de Bienvenue — vérifié en testant, pas supposé.
 */
import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: true }} />;
}
