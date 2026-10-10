/**
 * Salutation de l'Accueil (design/Home.dc.html) — « Bonjour » le jour, « Bonsoir » le soir.
 * Les maquettes n'illustrent que ces deux cas, pas de variante nuit/matin séparée.
 */
export function getGreeting(now: Date = new Date()): 'Bonjour' | 'Bonsoir' {
  const h = now.getHours();
  return h >= 5 && h < 18 ? 'Bonjour' : 'Bonsoir';
}
