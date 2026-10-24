/**
 * Authentification fictive — même transport que le reste de l'app (simulateRequest/ApiError
 * de src/mocks/api.ts : latence 300–900 ms, taux d'erreur réseau réglable). À brancher sur
 * Supabase Auth (OTP SMS) au Lot 8, derrière la même interface : les écrans n'appellent que
 * les fonctions ci-dessous (via hooks.ts), jamais Supabase directement.
 */
import { ApiError, simulateRequest } from '@/mocks/api';
import { user as mockUser } from '@/mocks/data';

/** Code accepté par verifyOtp() en attendant un vrai fournisseur SMS (Lot 8). */
export const TEST_OTP_CODE = '482917';

export type AuthUser = { userId: string; phone: string };

export type SignUpInput = {
  firstName: string;
  lastName: string;
  phone: string; // normalisé, ex. "0197451236"
  email: string;
  password: string;
};

function toE164(localPhone: string): string {
  return `+229${localPhone}`;
}

/** Déclenche l'envoi (simulé) d'un code SMS. Aucun état d'erreur maquetté sur Login/Téléphone. */
export async function requestOtp(phone: string): Promise<{ phone: string }> {
  return simulateRequest(() => ({ phone }));
}

/** design/Otp.dc.html : bouton « Vérifier » → « Code invalide. Réessayez. » si code ≠ 482917. */
export async function verifyOtp(phone: string, code: string): Promise<AuthUser> {
  return simulateRequest(() => {
    if (code !== TEST_OTP_CODE) {
      throw new ApiError('Code invalide. Réessayez.', 400);
    }
    return { userId: mockUser.id, phone: toE164(phone) };
  });
}

/**
 * design/SignupErrors.dc.html : « Ce numéro a déjà un compte. » quand le téléphone saisi
 * correspond au compte mock existant (src/mocks/data.ts, seul « utilisateur » connu tant
 * que le Lot 8 ne branche pas une vraie base).
 */
export async function signUp(input: SignUpInput): Promise<{ phone: string }> {
  return simulateRequest(() => {
    if (toE164(input.phone) === mockUser.phone) {
      throw new ApiError('Ce numéro a déjà un compte.', 409);
    }
    return { phone: input.phone };
  });
}

/**
 * Aucun état d'erreur maquetté sur Login/E-mail : résout toujours pour un identifiant
 * syntaxiquement valide (email/mot de passe déjà validés par zod avant l'appel).
 */
export async function signInWithEmail(input: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  return simulateRequest(() => ({ userId: mockUser.id, phone: mockUser.phone }));
}
