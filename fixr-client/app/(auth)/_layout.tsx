/**
 * Pile non connectée — affichée tant qu'aucune session n'existe (design/Architecture.dc.html).
 * headerShown: false (Lot 2) : chaque maquette (Main, Login, Otp, Signup) a son propre
 * en-tête custom (bouton retour + éventuel lien à droite), pas de barre native — inverse le
 * réglage par défaut du Lot 1 pour ce seul groupe de routes.
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
  return <Stack screenOptions={{ headerShown: false }} />;
}
