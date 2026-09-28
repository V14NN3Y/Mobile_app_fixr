/**
 * Généré depuis src/theme/tokens.ts par scripts/generate-theme.mjs — ne pas éditer à la main.
 * Classes NativeWind littérales par token de couleur, pour un mapping dynamique
 * (ex. Badge via tokens.statusTone) sans concaténation de chaîne à l'exécution —
 * NativeWind scanne le texte source, une classe assemblée au runtime ne serait pas générée.
 */
import type { ColorToken } from './tokens';

export const colorClasses: Record<ColorToken, { bg: string; text: string; border: string }> = {
  bg: { bg: 'bg-bg', text: 'text-bg', border: 'border-bg' },
  surface: { bg: 'bg-surface', text: 'text-surface', border: 'border-surface' },
  surfaceMuted: { bg: 'bg-surface-muted', text: 'text-surface-muted', border: 'border-surface-muted' },
  border: { bg: 'bg-border', text: 'text-border', border: 'border-border' },
  borderSubtle: { bg: 'bg-border-subtle', text: 'text-border-subtle', border: 'border-border-subtle' },
  borderStrong: { bg: 'bg-border-strong', text: 'text-border-strong', border: 'border-border-strong' },
  text: { bg: 'bg-text', text: 'text-text', border: 'border-text' },
  textSecondary: { bg: 'bg-text-secondary', text: 'text-text-secondary', border: 'border-text-secondary' },
  textTertiary: { bg: 'bg-text-tertiary', text: 'text-text-tertiary', border: 'border-text-tertiary' },
  textDisabled: { bg: 'bg-text-disabled', text: 'text-text-disabled', border: 'border-text-disabled' },
  primary: { bg: 'bg-primary', text: 'text-primary', border: 'border-primary' },
  primaryPressed: { bg: 'bg-primary-pressed', text: 'text-primary-pressed', border: 'border-primary-pressed' },
  primarySoft: { bg: 'bg-primary-soft', text: 'text-primary-soft', border: 'border-primary-soft' },
  onPrimary: { bg: 'bg-on-primary', text: 'text-on-primary', border: 'border-on-primary' },
  accent: { bg: 'bg-accent', text: 'text-accent', border: 'border-accent' },
  accentSoft: { bg: 'bg-accent-soft', text: 'text-accent-soft', border: 'border-accent-soft' },
  accentInk: { bg: 'bg-accent-ink', text: 'text-accent-ink', border: 'border-accent-ink' },
  onAccent: { bg: 'bg-on-accent', text: 'text-on-accent', border: 'border-on-accent' },
  success: { bg: 'bg-success', text: 'text-success', border: 'border-success' },
  successSoft: { bg: 'bg-success-soft', text: 'text-success-soft', border: 'border-success-soft' },
  successInk: { bg: 'bg-success-ink', text: 'text-success-ink', border: 'border-success-ink' },
  warning: { bg: 'bg-warning', text: 'text-warning', border: 'border-warning' },
  warningSoft: { bg: 'bg-warning-soft', text: 'text-warning-soft', border: 'border-warning-soft' },
  warningInk: { bg: 'bg-warning-ink', text: 'text-warning-ink', border: 'border-warning-ink' },
  danger: { bg: 'bg-danger', text: 'text-danger', border: 'border-danger' },
  dangerSoft: { bg: 'bg-danger-soft', text: 'text-danger-soft', border: 'border-danger-soft' },
  dangerBorder: { bg: 'bg-danger-border', text: 'text-danger-border', border: 'border-danger-border' },
  dangerPressed: { bg: 'bg-danger-pressed', text: 'text-danger-pressed', border: 'border-danger-pressed' },
  dangerInk: { bg: 'bg-danger-ink', text: 'text-danger-ink', border: 'border-danger-ink' },
  fieldErrorBg: { bg: 'bg-field-error-bg', text: 'text-field-error-bg', border: 'border-field-error-bg' },
  onDanger: { bg: 'bg-on-danger', text: 'text-on-danger', border: 'border-on-danger' },
  rating: { bg: 'bg-rating', text: 'text-rating', border: 'border-rating' },
  online: { bg: 'bg-online', text: 'text-online', border: 'border-online' },
  disabledBg: { bg: 'bg-disabled-bg', text: 'text-disabled-bg', border: 'border-disabled-bg' },
  skeletonBase: { bg: 'bg-skeleton-base', text: 'text-skeleton-base', border: 'border-skeleton-base' },
  skeletonHighlight: { bg: 'bg-skeleton-highlight', text: 'text-skeleton-highlight', border: 'border-skeleton-highlight' },
  toastBg: { bg: 'bg-toast-bg', text: 'text-toast-bg', border: 'border-toast-bg' },
  toastText: { bg: 'bg-toast-text', text: 'text-toast-text', border: 'border-toast-text' },
  toastSuccess: { bg: 'bg-toast-success', text: 'text-toast-success', border: 'border-toast-success' },
  toastAction: { bg: 'bg-toast-action', text: 'text-toast-action', border: 'border-toast-action' },
  offlineBg: { bg: 'bg-offline-bg', text: 'text-offline-bg', border: 'border-offline-bg' },
  offlineText: { bg: 'bg-offline-text', text: 'text-offline-text', border: 'border-offline-text' },
  scrim: { bg: '', text: '', border: '' }, // hors variables CSS — utiliser useTheme().colors
};
