/**
 * Schémas zod — messages exacts des maquettes (design/Login.dc.html, Otp.dc.html,
 * Signup.dc.html, SignupErrors.dc.html). Syntaxe vérifiée contre zod@4.6.5.
 */
import { z } from 'zod';

import { isPasswordValid } from './password';

/** « 01 97 45 12 36 » (saisie) → « 0197451236 » (10 chiffres, préfixe 01 — CLAUDE.md). */
export const phoneSchema = z
  .string()
  .transform((s) => s.replace(/\s+/g, ''))
  .refine((v) => /^01\d{8}$/.test(v), {
    message: 'Numéro invalide (10 chiffres, commence par 01).',
  });

export const emailSchema = z
  .string()
  .min(1, 'Adresse incomplète — exemple : nom@gmail.com')
  .email('Adresse incomplète — exemple : nom@gmail.com');

export const passwordSchema = z.string().superRefine((val, ctx) => {
  if (!isPasswordValid(val)) {
    ctx.addIssue({ code: 'custom', message: 'Le mot de passe ne respecte pas tous les critères.' });
  }
});

export const signUpSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis.'),
  lastName: z.string().min(1, 'Le nom est requis.'),
  phone: phoneSchema,
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.literal(true, { message: 'Acceptez les conditions pour continuer.' }),
});
export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const loginPhoneSchema = z.object({ phone: phoneSchema });
export type LoginPhoneFormValues = z.infer<typeof loginPhoneSchema>;

export const loginEmailSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Le mot de passe est requis.'),
});
export type LoginEmailFormValues = z.infer<typeof loginEmailSchema>;

export const otpSchema = z.object({
  code: z.string().length(6, 'Entrez les 6 chiffres.'),
});
export type OtpFormValues = z.infer<typeof otpSchema>;
