/**
 * Pile non connectée — affichée tant qu'aucune session n'existe (design/Architecture.dc.html).
 * Chaque écran affiche son propre en-tête natif (titre + retour), posé via
 * <Stack.Screen options={{ title }} /> dans chaque fichier de route.
 */
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: true }} />;
}
