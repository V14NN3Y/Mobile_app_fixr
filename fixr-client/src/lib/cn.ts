/** Concatène des classes NativeWind en ignorant les valeurs vides. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** camelCase → kebab-case, pour retrouver le nom de classe Tailwind d'un token de couleur. */
export function kebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
