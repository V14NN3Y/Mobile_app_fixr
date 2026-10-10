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

/** « Koffi », « Agbodjan » → « KA » (avatars). */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** 1.2 → « 1,2 km » ; 28 → « 28 km » (pas de décimale pour un nombre entier). */
export function formatDistanceKm(km: number): string {
  const rounded = Math.round(km * 10) / 10;
  const digits = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace('.', ',');
  return `${digits} km`;
}

const SHORT_MONTHS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

/** 2026-09-12T... → « 12 sept. » (pas d'Intl : Hermes ne garantit pas la locale « fr »). */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`;
}

const SHORT_WEEKDAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

/** 2026-09-29T... → « mar. 29 sept. » (CLAUDE.md : format de date court). */
export function formatWeekdayDate(iso: string): string {
  const d = new Date(iso);
  return `${SHORT_WEEKDAYS[d.getDay()]} ${formatShortDate(iso)}`;
}

/** 2026-09-28T13:52:00+01:00 → « 13:52 » (CLAUDE.md : heures 14:00 – 16:00). */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 2026-09-28T13:52:00+01:00 → « mar. 28 sept. · 13:52 ». */
export function formatWeekdayDateTime(iso: string): string {
  return `${formatWeekdayDate(iso)} · ${formatTime(iso)}`;
}

/** +2290197451236 → « +229 01 97 45 12 36 » (CLAUDE.md : numéros béninois à 10 chiffres). */
export function formatPhone(e164: string): string {
  const digits = e164.replace('+229', '');
  const groups = digits.match(/.{1,2}/g) ?? [digits];
  return `+229 ${groups.join(' ')}`;
}

/** +2290197451236 → « +229 01 97 45 •• 36 » (masque le 4ᵉ groupe, détail de réservation). */
export function formatPhoneMasked(e164: string): string {
  const digits = e164.replace('+229', '');
  const groups = digits.match(/.{1,2}/g) ?? [digits];
  if (groups[3]) groups[3] = '••';
  return `+229 ${groups.join(' ')}`;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * 2026-09-28T13:52 → « 13:52 » (aujourd'hui) ; 2026-09-27T... → « Hier » ; plus ancien →
 * formatShortDate (« 26 sept. »). Liste des conversations (design/Messages.dc.html).
 */
export function formatConversationTime(iso: string, now: Date): string {
  const d = new Date(iso);
  if (isSameCalendarDay(d, now)) return formatTime(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(d, yesterday)) return 'Hier';
  return formatShortDate(iso);
}
