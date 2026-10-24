/**
 * Authentification réelle (Lot 8) — Supabase Auth, OTP par téléphone. Les écrans n'ont pas
 * changé (login.tsx/signup.tsx/verify-otp.tsx appellent les mêmes 4 fonctions) ; ce qui
 * change est purement interne à ce fichier.
 *
 * Supabase ne distingue pas « inscription » et « connexion » côté OTP téléphone :
 * signInWithOtp() envoie un code que le numéro ait déjà un compte ou non
 * (shouldCreateUser: true par défaut en crée un au besoin). signUp() ne peut donc pas créer
 * le compte tout de suite (on n'a pas encore vérifié le téléphone) : il mémorise
 * prénom/nom/e-mail/mot de passe dans `pendingSignup`, verifyOtp() les applique après coup
 * (insert profiles + définit le mot de passe, pour que l'onglet E-mail de Connexion
 * fonctionne ensuite pour ce compte — sinon le mot de passe saisi à l'inscription n'aurait
 * jamais d'effet, comme c'était déjà le cas côté mock).
 */
import { ApiError } from '@/lib/apiError';
import { supabase } from '@/lib/supabase';

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

let pendingSignup: { firstName: string; lastName: string; email: string; password: string } | null = null;

export async function requestOtp(phone: string): Promise<{ phone: string }> {
  const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) });
  if (error) throw new ApiError(error.message);
  return { phone };
}

export async function verifyOtp(phone: string, code: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.verifyOtp({ phone: toE164(phone), token: code, type: 'sms' });
  if (error) throw new ApiError('Code invalide. Réessayez.', 400);
  const user = data.user!;

  if (pendingSignup) {
    const { firstName, lastName, email, password } = pendingSignup;
    pendingSignup = null;
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: user.id, first_name: firstName, last_name: lastName, phone: toE164(phone), email });
    if (profileError) throw new ApiError(profileError.message);
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) throw new ApiError(passwordError.message);
  }

  return { userId: user.id, phone: user.phone ?? toE164(phone) };
}

/** Vérifie l'unicité du téléphone via une RPC étroite (phone_has_account, migration
 * 0007) : cet appel se fait AVANT l'OTP, donc sans session (rôle anon) — RLS interdit toute
 * lecture directe de `profiles` à ce rôle, à raison. La création réelle attend verifyOtp(). */
export async function signUp(input: SignUpInput): Promise<{ phone: string }> {
  const { data: exists, error } = await supabase.rpc('phone_has_account', {
    check_phone: toE164(input.phone),
  });
  if (error) throw new ApiError(error.message);
  if (exists) throw new ApiError('Ce numéro a déjà un compte.', 409);

  pendingSignup = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: input.password,
  };
  const { error: otpError } = await supabase.auth.signInWithOtp({ phone: toE164(input.phone) });
  if (otpError) throw new ApiError(otpError.message);
  return { phone: input.phone };
}

export async function signInWithEmail(input: { email: string; password: string }): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword(input);
  if (error) throw new ApiError(error.message);
  return { userId: data.user.id, phone: data.user.phone ?? '' };
}
