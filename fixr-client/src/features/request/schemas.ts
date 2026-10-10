/**
 * Validation du brouillon de demande — messages exacts des maquettes
 * (design/RequestNeed.dc.html, RequestAddress.dc.html, RequestDate.dc.html). zod@4.6.5.
 * Pas de react-hook-form ici : le brouillon vit dans un store zustand persisté qui doit
 * survivre à la navigation entre étapes, pas dans l'état d'un formulaire local — chaque
 * écran appelle juste `schema.safeParse(draft).success` pour calculer `canContinue` en
 * réaction aux changements du store, sans dupliquer la saisie dans une 2ᵉ source de vérité.
 */
import { z } from 'zod';

export const needSchema = z.object({
  title: z.string().trim().min(5),
  categoryId: z.string(),
  urgency: z.enum(['now', 'week', 'flexible']),
});
export type NeedFormValues = z.infer<typeof needSchema>;

export const addressStepSchema = z.object({
  addressId: z.string(),
});
export type AddressStepFormValues = z.infer<typeof addressStepSchema>;

export const dateStepSchema = z.object({
  dayOffset: z.number(),
  slotIndex: z.number(),
});
export type DateStepFormValues = z.infer<typeof dateStepSchema>;

/** Revalidation défensive avant createBooking — garde contre un brouillon MMKV partiel. */
export const fullRequestSchema = needSchema.extend(addressStepSchema.shape).extend(dateStepSchema.shape);
