import { simulateRequest } from '@/mocks/api';
import { user } from '@/mocks/data';
import type { User } from '@/types/domain';

export async function getCurrentUser(): Promise<User> {
  return simulateRequest(() => user);
}

/** Lot 7 : suppression de compte simulée — aucune suppression réelle avant le backend
 * (Lot 8/Supabase), mais passe par simulateRequest comme toute autre action destructive de
 * l'app (annulation de réservation…) plutôt qu'un raccourci instantané. */
export async function deleteAccount(): Promise<void> {
  return simulateRequest(() => undefined);
}
