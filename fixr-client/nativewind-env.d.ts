/// <reference types="nativewind/types" />

// NativeWind ne fournit pas de déclaration pour l'import CSS d'effet de bord
// (`import '@/theme/global.css'` dans app/_layout.tsx, lu par le plugin Metro).
declare module '*.css';
