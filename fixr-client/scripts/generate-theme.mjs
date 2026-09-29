/**
 * Régénère src/theme/global.css et tailwind.config.js depuis src/theme/tokens.ts.
 * À relancer après toute modification de tokens.ts :  node scripts/generate-theme.mjs
 * Les couleurs non hexadécimales (scrim) ne deviennent pas des variables CSS :
 * elles se lisent via useTheme().colors.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = new URL('../src/theme/tokens.ts', import.meta.url);
const src = readFileSync(SRC, 'utf8');

const block = (name, open) => {
  const start = src.indexOf(open);
  if (start === -1) throw new Error(`bloc ${name} introuvable`);
  let depth = 0;
  let i = start + open.length - 1;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) break;
  }
  return src.slice(start, i + 1);
};

const pairs = (text, re) => {
  const out = {};
  for (const m of text.matchAll(re)) out[m[1]] = m[2];
  return out;
};

const STR = /^\s{4}(\w+):\s*'([^']+)'/gm;
const colors = {
  light: pairs(block('colors.light', '  light: {'), STR),
  dark: pairs(block('colors.dark', '  dark: {'), STR),
};

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const isHex = (v) => /^#[0-9A-Fa-f]{6}$/.test(v);
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');

const hexKeys = Object.keys(colors.light).filter(
  (k) => isHex(colors.light[k]) && isHex(colors.dark[k]),
);
const skipped = Object.keys(colors.light).filter((k) => !hexKeys.includes(k));

/* ---------- global.css ---------- */
const vars = (scheme, indent) =>
  hexKeys.map((k) => `${indent}--color-${kebab(k)}: ${rgb(colors[scheme][k])};`).join('\n');

const css = `/* Généré depuis src/theme/tokens.ts par scripts/generate-theme.mjs — ne pas éditer à la main. */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
${vars('light', '  ')}
}

/* Mode sombre : classe .dark sur l'élément racine, pas @media — tailwind.config.js déclare
   darkMode: 'class', requis pour que colorScheme.set('light'|'dark'|'system')
   (src/theme/ThemeProvider.tsx) puisse effectivement piloter ces variables. Une simple
   @media (prefers-color-scheme: dark) ignorerait ce bouton : elle ne suit que l'OS, jamais
   un choix manuel (vérifié en testant un rendu web réel — voir le commentaire du fichier). */
:root.dark {
${vars('dark', '  ')}
}
`;
writeFileSync(new URL('../src/theme/global.css', import.meta.url), css);

/* ---------- tailwind.config.js ---------- */
const NUM = /^\s{2}(\w+):\s*(\d+)/gm;
const space = pairs(block('space', 'export const space = {'), /(\d+):\s*(\d+)/g);
const radius = pairs(block('radius', 'export const radius = {'), /^\s{2}'?([\w.]+)'?:\s*(\d+)/gm);
const size = pairs(block('size', 'export const size = {'), NUM);
const fonts = pairs(
  block('fonts', 'export const fonts = {'),
  STR.source ? /^\s{2}(\w+):\s*'([^']+)'/gm : null,
);

const typo = {};
for (const m of block('typography', 'export const typography = {').matchAll(
  /^\s{2}(\w+):\s*\{([^}]+)\}/gm,
)) {
  const get = (k) => m[2].match(new RegExp(`${k}:\\s*(-?[\\d.]+)`))?.[1];
  typo[m[1]] = {
    fontSize: get('fontSize'),
    lineHeight: get('lineHeight'),
    letterSpacing: get('letterSpacing'),
  };
}

const q = (s) => `'${s}'`;
const colorLines = hexKeys
  .map((k) => `        ${q(kebab(k))}: 'rgb(var(--color-${kebab(k)}) / <alpha-value>)',`)
  .join('\n');
const fontFamilyLines = Object.entries(fonts)
  .map(([k, v]) => `        ${q(kebab(k))}: [${q(v)}],`)
  .join('\n');
const fontSizeLines = Object.entries(typo)
  .map(([k, v]) => {
    const extra = [`lineHeight: '${v.lineHeight}px'`];
    if (v.letterSpacing) extra.push(`letterSpacing: '${v.letterSpacing}px'`);
    return `        ${q(kebab(k))}: ['${v.fontSize}px', { ${extra.join(', ')} }],`;
  })
  .join('\n');
const radiusLines = Object.entries(radius)
  .filter(([k]) => k !== 'full')
  .map(([k, v]) => `        ${q(k)}: '${v}px',`)
  .join('\n');
const spacingLines = [
  ...Object.entries(space).map(([k, v]) => `        ${q(k)}: '${v}px',`),
  `        screen: '${size.screenPadding}px',`,
  `        touch: '${size.touchMin}px',`,
  `        button: '${size.button}px',`,
  `        'button-md': '${size.buttonMd}px',`,
  `        'button-sm': '${size.buttonSm}px',`,
  `        input: '${size.input}px',`,
  `        'tab-bar': '${size.tabBar}px',`,
].join('\n');

const tw = `/**
 * Généré depuis src/theme/tokens.ts par scripts/generate-theme.mjs — ne pas éditer à la main.
 * Les couleurs pointent vers les variables CSS de src/theme/global.css (clair + sombre).
 * Non exposés en classes (valeurs non hexadécimales) : ${skipped.join(', ')} — via useTheme().colors.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Requis pour colorScheme.set() (src/theme/ThemeProvider.tsx) : avec 'media' (défaut
  // Tailwind), NativeWind refuse tout bascule manuel ("Cannot manually set color scheme,
  // as dark mode is type 'media'").
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
${colorLines}
      },
      fontFamily: {
${fontFamilyLines}
      },
      fontSize: {
${fontSizeLines}
      },
      borderRadius: {
${radiusLines}
      },
      spacing: {
${spacingLines}
      },
    },
  },
  plugins: [],
};
`;
writeFileSync(new URL('../tailwind.config.js', import.meta.url), tw);

/* ---------- src/theme/colorClasses.ts ---------- */
// Table de noms de classes Tailwind LITTÉRAUX (pas de concaténation à l'exécution :
// le compilateur NativeWind scanne le texte source, il n'exécute rien — une classe
// construite dynamiquement ne serait jamais générée).
const classEntry = (k) => {
  const kb = kebab(k);
  return `  ${k}: { bg: 'bg-${kb}', text: 'text-${kb}', border: 'border-${kb}' },`;
};
const colorClassesTs = `/**
 * Généré depuis src/theme/tokens.ts par scripts/generate-theme.mjs — ne pas éditer à la main.
 * Classes NativeWind littérales par token de couleur, pour un mapping dynamique
 * (ex. Badge via tokens.statusTone) sans concaténation de chaîne à l'exécution —
 * NativeWind scanne le texte source, une classe assemblée au runtime ne serait pas générée.
 */
import type { ColorToken } from './tokens';

export const colorClasses: Record<ColorToken, { bg: string; text: string; border: string }> = {
${hexKeys.map(classEntry).join('\n')}
${skipped.map((k) => `  ${k}: { bg: '', text: '', border: '' }, // hors variables CSS — utiliser useTheme().colors`).join('\n')}
};
`;
writeFileSync(new URL('../src/theme/colorClasses.ts', import.meta.url), colorClassesTs);

console.log(
  `global.css + tailwind.config.js + colorClasses.ts régénérés : ${hexKeys.length} couleurs, ` +
    `${Object.keys(typo).length} styles de texte, ${Object.keys(space).length} espacements.` +
    (skipped.length ? `\nHors variables CSS : ${skipped.join(', ')}` : ''),
);
