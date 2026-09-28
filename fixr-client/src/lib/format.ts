/**
 * Formats FCFA, conformes à CLAUDE.md.
 * Séparateur de milliers : espace fine insécable (U+202F), comme en typographie française.
 * Avant le symbole monétaire : espace insécable (U+00A0), pour que le montant ne se coupe
 * jamais de son unité en fin de ligne.
 * Implémentation manuelle et non Intl : Hermes ne garantit pas le choix du séparateur.
 */

/** Espace fine insécable — séparateur de milliers. */
export const NNBSP = ' ';
/** Espace insécable — avant « FCFA ». */
export const NBSP = ' ';
/** Tiret demi-cadratin des fourchettes de prix. */
export const EN_DASH = '–';

export const CURRENCY = 'FCFA';
/** Libellé utilisé quand aucun montant n'est connu. */
export const ON_QUOTE = 'Sur devis';

/** Groupe les milliers : 22500 → « 22 500 » (avec U+202F). */
export function formatAmount(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  const sign = amount < 0 ? '-' : '';
  const digits = String(rounded);
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += NNBSP;
    out += digits[i];
  }
  return sign + out;
}

/** 22500 → « 22 500 FCFA ». `null` / `undefined` → « Sur devis ». */
export function formatFCFA(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return ON_QUOTE;
  return `${formatAmount(amount)}${NBSP}${CURRENCY}`;
}

/** 15000, 25000 → « 15 000 – 25 000 FCFA ». Bornes égales → montant simple. */
export function formatFCFARange(min: number, max: number): string {
  if (min === max) return formatFCFA(min);
  return `${formatAmount(min)}${NNBSP}${EN_DASH}${NNBSP}${formatAmount(max)}${NBSP}${CURRENCY}`;
}

/** 5000 → « Dès 5 000 FCFA ». `null` → « Sur devis ». */
export function formatFCFAFrom(from: number | null | undefined): string {
  if (from === null || from === undefined) return ON_QUOTE;
  return `Dès ${formatFCFA(from)}`;
}
