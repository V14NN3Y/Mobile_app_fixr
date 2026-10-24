/**
 * Sentry (Lot 9) — DSN vide = SDK inactif, pas d'erreur (même philosophie que USE_MOCKS,
 * src/lib/env.ts) : aucun compte Sentry n'existe encore dans cet environnement, ce module
 * doit donc pouvoir s'exécuter sans aucune variable d'environnement, en CI/Jest comme en
 * dev local. `Sentry.wrap()` (app/_layout.tsx) reste sans effet tant qu'init() n'a pas été
 * appelée avec un DSN réel.
 */
import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const SENTRY_ENABLED = Boolean(dsn);

export function initSentry(): void {
  if (!dsn) return;
  Sentry.init({ dsn, sendDefaultPii: false, tracesSampleRate: 0.2 });
}

export { Sentry };
