/**
 * Bascule mock ↔ Supabase (Lot 8). Par défaut : si aucune URL Supabase n'est configurée
 * (CI, Jest — ces variables ne sont jamais injectées dans ces environnements), on retombe
 * automatiquement sur les mocks, sans aucun changement à jest.config.js/jest.setup.ts.
 * Dès que .env.local est renseigné (dev local avec `supabase start` lancé), le backend réel
 * devient le défaut ; EXPO_PUBLIC_USE_MOCKS=true force les mocks explicitement (démo rapide
 * sans Docker, etc.).
 */
export const USE_MOCKS =
  process.env.EXPO_PUBLIC_USE_MOCKS === 'true' || !process.env.EXPO_PUBLIC_SUPABASE_URL;
