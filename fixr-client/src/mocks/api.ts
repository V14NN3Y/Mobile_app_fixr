/**
 * Faux transport réseau — latence aléatoire + taux d'erreur réglable, pour simuler
 * l'API avant le Lot 8 (Supabase). Les fonctions par domaine (getBookings,
 * getArtisanById…) vivent dans features/<domaine>/api.ts et s'appuient sur
 * simulateRequest() ; ce fichier ne porte que la plomberie commune.
 */

export const MIN_DELAY_MS = 300;
export const MAX_DELAY_MS = 900;

/**
 * Configuration mutable du faux client API.
 * `errorRate` (0–1) : proportion des appels qui échouent. Valeur initiale optionnelle via
 * EXPO_PUBLIC_MOCK_API_ERROR_RATE (ex. pour un parcours Maestro qui teste les erreurs),
 * ajustable ensuite à chaud via setErrorRate().
 */
export const apiConfig = {
  errorRate: Number(process.env.EXPO_PUBLIC_MOCK_API_ERROR_RATE ?? 0),
};

/** Règle apiConfig.errorRate (borné 0–1). */
export function setErrorRate(rate: number): void {
  apiConfig.errorRate = Math.min(1, Math.max(0, rate));
}

export class ApiError extends Error {
  constructor(
    message = 'Une erreur est survenue. Réessayez.',
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function randomDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simule un aller-retour réseau : attend 300–900 ms puis résout `resolve()`, ou rejette
 * une ApiError selon apiConfig.errorRate.
 *
 * @example
 * export function useArtisan(id: string) {
 *   return useQuery({
 *     queryKey: ['artisan', id],
 *     queryFn: () => simulateRequest(() => {
 *       const artisan = artisans.find((a) => a.id === id);
 *       if (!artisan) throw new ApiError('Artisan introuvable', 404);
 *       return artisan;
 *     }),
 *   });
 * }
 */
export async function simulateRequest<T>(resolve: () => T | Promise<T>): Promise<T> {
  await wait(randomDelay());
  if (Math.random() < apiConfig.errorRate) {
    throw new ApiError();
  }
  return resolve();
}
