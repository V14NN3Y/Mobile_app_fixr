/**
 * Erreur API partagée par le faux client (src/mocks/api.ts) et les implémentations réelles
 * (chaque features/<domaine>/api.supabase.ts) — l'UI ne distingue jamais les deux
 * ("e instanceof ApiError").
 */
export class ApiError extends Error {
  constructor(
    message = 'Une erreur est survenue. Réessayez.',
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
