/**
 * Critères de robustesse du mot de passe — source unique pour la checklist visuelle
 * (PasswordCriteriaChecklist), l'indicateur de force (PasswordStrengthMeter) et la
 * validation zod (schemas.ts). Libellés exacts de design/SignupErrors.dc.html.
 */
import { fr } from '@/lib/i18n/fr';

export type PasswordCriterion = {
  key: 'length' | 'uppercase' | 'digit' | 'symbol';
  label: string;
  met: boolean;
};

export type PasswordCriteria = [
  length: PasswordCriterion,
  uppercase: PasswordCriterion,
  digit: PasswordCriterion,
  symbol: PasswordCriterion,
];

/** Toujours ces 4 critères, dans cet ordre — tuple plutôt qu'un tableau générique pour que
 *  la déstructuration (PasswordCriteriaChecklist) reste sûre sous noUncheckedIndexedAccess. */
export function getPasswordCriteria(password: string): PasswordCriteria {
  const c = fr.auth.signup.passwordCriteria;
  return [
    { key: 'length', label: c.length, met: password.length >= 8 },
    { key: 'uppercase', label: c.uppercase, met: /[A-Z]/.test(password) },
    { key: 'digit', label: c.digit, met: /\d/.test(password) },
    { key: 'symbol', label: c.symbol, met: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isPasswordValid(password: string): boolean {
  return getPasswordCriteria(password).every((c) => c.met);
}

/** 0 (vide) à 4 (tous les critères) — alimente PasswordStrengthMeter. */
export function getPasswordScore(password: string): number {
  if (!password) return 0;
  return getPasswordCriteria(password).filter((c) => c.met).length;
}

export function getPasswordStrengthLabel(score: number): string {
  const labels = fr.auth.signup.passwordStrength;
  if (score >= 4) return labels.strong;
  if (score >= 2) return labels.medium;
  return labels.weak;
}
