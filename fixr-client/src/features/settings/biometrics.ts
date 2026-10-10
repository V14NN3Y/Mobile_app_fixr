/**
 * Déverrouillage biométrique (Settings.dc.html) — expo-local-authentication n'a pas
 * d'authenticateAsync sur web (confirmé : ExpoLocalAuthentication.web.ts n'exporte que
 * hasHardwareAsync/isEnrolledAsync/getEnrolledLevelAsync), donc toute tentative réelle est
 * gardée par Platform.OS. À l'activation, une authentification unique confirme que
 * l'appareil peut vraiment le faire avant de persister la préférence (features/settings/store.ts) —
 * à la désactivation, aucune invite n'est nécessaire.
 */
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricAvailability = { hardware: boolean; enrolled: boolean };

export async function getBiometricAvailability(): Promise<BiometricAvailability> {
  if (Platform.OS === 'web') return { hardware: false, enrolled: false };
  const [hardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return { hardware, enrolled };
}

/** Authentifie une fois pour confirmer l'activation — renvoie false si indisponible, annulé
 * ou échoué (jamais une exception, l'appelant se contente d'un booléen). */
export async function confirmBiometricUnlock(promptMessage: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const result = await LocalAuthentication.authenticateAsync({ promptMessage });
  return result.success;
}
