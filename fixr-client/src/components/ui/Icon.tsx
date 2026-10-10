/**
 * Jeu d'icônes FIXR — grille 24, trait 1.8, extrémités et jointures arrondies.
 * Planche de référence : design/DesignSystem.dc.html (§07 Iconographie) et les usages
 * ponctuels de design/Components.dc.html (mail, hors connexion, étoile…).
 *
 * `peinture` et `menuiserie` n'ont de tracé dans AUCUNE maquette (seules plomberie,
 * électricité, climatisation, réparation, nettoyage, serrurerie y figurent) : dessinées
 * ici dans le même style (rouleau / scie-planche) — signalé au Lot 0, à valider.
 */
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useMemo } from 'react';

type IconSpec = {
  paths?: string[];
  rects?: { x: number; y: number; width: number; height: number; rx?: number }[];
  circles?: { cx: number; cy: number; r: number }[];
  /** true = tracé fermé rempli (ex. étoile), sans trait. */
  filled?: boolean;
};

const registry = {
  // Planche 07 — navigation & système
  home: { paths: ['M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'] },
  search: { paths: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5'] },
  calendar: {
    paths: [
      'M6 5h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM3 10h18M8 3v4M16 3v4',
    ],
  },
  message: { paths: ['M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z'] },
  user: { paths: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'] },
  alert: { paths: ['M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0'] },
  location: { paths: ['M12 21s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12z'] },
  verified: { paths: ['M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6zM8.5 12l2.5 2.5 4.5-5'] },
  call: {
    paths: [
      'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
    ],
  },
  photo: {
    paths: ['M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z'],
  },
  clock: { paths: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2'] },
  flag: { paths: ['M5 21V4h11l-2 4 2 4H5'] },

  // Catégories de service (tokens.categoryTints)
  plomberie: { paths: ['M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z'] },
  electricite: { paths: ['M13 2 4 14h7l-1 8 9-12h-7z'] },
  climatisation: { paths: ['M12 2v20M4.9 7l14.2 10M4.9 17 19.1 7'] },
  reparation: {
    paths: [
      'M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z',
    ],
  },
  nettoyage: { paths: ['M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z'] },
  serrurerie: {
    paths: ['M10.6 13.4A4.5 4.5 0 1 1 4.2 19.8a4.5 4.5 0 0 1 6.4-6.4zM10.6 13.4 20 4M17 7l3 3'],
  },
  // Non maquettées — dessinées dans le même style, à valider (voir en-tête de fichier).
  peinture: { paths: ['M7 3h8v5l-2 2v9a2 2 0 0 1-4 0v-9L7 8z', 'M9 3v2h4V3'] },
  menuiserie: { paths: ['M3 17 17 3l4 4L7 21H3v-4z', 'm14 6 4 4'] },

  // UI générique
  mail: { rects: [{ x: 3, y: 5, width: 18, height: 14, rx: 3 }], paths: ['m4 7 8 6 8-6'] },
  wifiOff: {
    paths: [
      'M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19v.01M3 3l18 18',
    ],
  },
  star: {
    filled: true,
    paths: ['m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z'],
  },
  // Favoris (ArtisanProfile) — rempli quand actif, via filled=true côté appelant.
  heart: {
    paths: [
      'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    ],
  },
  check: { paths: ['m5 12.5 4.5 4.5L19 7'] },
  chevronRight: { paths: ['m9 5 7 7-7 7'] },
  chevronLeft: { paths: ['m15 5-7 7 7 7'] },
  chevronDown: { paths: ['m5 9 7 7 7-7'] },
  lock: {
    rects: [{ x: 5, y: 11, width: 14, height: 10, rx: 2 }],
    paths: ['M8 11V7a4 4 0 0 1 8 0v4'],
  },
  eye: {
    paths: ['M2 12S5.5 5.5 12 5.5 22 12 22 12 18.5 18.5 12 18.5 2 12 2 12z'],
    circles: [{ cx: 12, cy: 12, r: 3 }],
  },
  eyeOff: {
    paths: [
      'M3 3l18 18',
      'M10.73 5.08A10.43 10.43 0 0 1 12 5c6 0 10 7 10 7a13.16 13.16 0 0 1-4.24 4.94',
      'M6.31 6.31C3.66 8.14 2 12 2 12s2.16 4.16 6.06 5.94',
      'M9.53 9.53a3 3 0 0 0 4.24 4.24',
    ],
  },
  close: { paths: ['m6 6 12 12M18 6 6 18'] },
  plus: { paths: ['M12 5v14M5 12h14'] },
  sliders: {
    paths: ['M5 6h6M15 6h4M5 12h2M11 12h8M5 18h10M19 18h0'],
    circles: [
      { cx: 13, cy: 6, r: 2 },
      { cx: 9, cy: 12, r: 2 },
      { cx: 17, cy: 18, r: 2 },
    ],
  },
  // Recentrage carte (ResultsMap)
  crosshair: {
    paths: ['M22 12h-4M6 12H2M12 6V2M12 22v-4'],
    circles: [{ cx: 12, cy: 12, r: 10 }],
  },
  // Partage (ArtisanProfile)
  share: {
    paths: ['M8.59 13.51 15.42 17.49M15.41 6.51 8.59 10.49'],
    circles: [
      { cx: 18, cy: 5, r: 3 },
      { cx: 6, cy: 12, r: 3 },
      { cx: 18, cy: 19, r: 3 },
    ],
  },
  // Copier (RequestSuccess)
  copy: {
    rects: [{ x: 9, y: 9, width: 13, height: 13, rx: 2 }],
    paths: ['M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
  },
  // Vignette vidéo (RequestNeed, ArtisanProfile galerie)
  play: { filled: true, paths: ['M8 5v14l11-7z'] },
  // Annulation (CancelBookingSheet) — rond barré, distinct de `alert` (cloche)
  cancel: {
    circles: [{ cx: 12, cy: 12, r: 9 }],
    paths: ['m9 9 6 6M15 9l-6 6'],
  },
  // Aide (MissionLive)
  help: {
    circles: [{ cx: 12, cy: 12, r: 9 }],
    paths: ['M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01'],
  },
  // Modifier (MissionLive)
  edit: { paths: ['M4 20h4L19 9l-4-4L4 16z'] },
  // Télécharger le rapport en PDF (Report)
  download: { paths: ['M12 4v12M7 11l5 5 5-5M5 20h14'] },
  // Garantie FIXR (Report) — bouclier seul, sans la coche de `verified`
  shield: { paths: ['M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z'] },

  // Lot 6 — Messages et notifications
  // Message système « en route » (Chat) + type on_the_way (Notifications) — flèche d'envoi,
  // distincte de `call`/`location`.
  navigation: { paths: ['M3 11 21 3l-8 18-2-8z'] },
  // Bulle photo reçue/envoyée (Chat) — image/paysage, distincte de la caméra `photo`
  // (bouton pièce-jointe).
  image: {
    rects: [{ x: 3, y: 4, width: 18, height: 16, rx: 3 }],
    circles: [{ cx: 9, cy: 10, r: 2 }],
    paths: ['m21 16-5-5-8 9'],
  },
  // Coche de lecture double (Messages liste « Lu », Chat meta) — distincte de `check` (simple).
  checkDouble: { paths: ['m2 12 5 5L17 7M12 16l1 1L23 7'] },
  // Bouton d'envoi (Chat)
  send: { paths: ['M4 12 20 4l-6 16-3-7z'] },
  // Notification type report_ready — document avec coin plié.
  document: { paths: ['M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6'] },
  // Notification type payment — carte de paiement.
  card: {
    paths: ['M5 6h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM3 10h18M7 15h4'],
  },
  // Notification type security — bouclier + point d'exclamation, distinct du `shield` nu
  // du Rapport (Lot 5, sans exclamation).
  shieldAlert: {
    paths: [
      'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z',
      'M12 9v4M12 16v.01',
    ],
  },
  // État vide des notifications — cloche + coche, distincte de `alert` (cloche + battant).
  bellCheck: {
    paths: ['M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8', 'm9 11 2 2 4-4'],
  },

  // Lot 7 — Profil, paramètres et finitions
  // Bouton d'en-tête du Profil (engrenage), distinct de `sliders`/`preferences`.
  gear: {
    circles: [{ cx: 12, cy: 12, r: 3 }],
    paths: [
      'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    ],
  },
  // Ligne « Paramètres » du Profil — 2 rangées + 2 curseurs, distincte de `sliders` (3 rangées).
  preferences: {
    paths: ['M4 7h10M18 7h2M4 17h4M12 17h8'],
    circles: [
      { cx: 16, cy: 7, r: 2 },
      { cx: 10, cy: 17, r: 2 },
    ],
  },
  // Badge de la feuille de suppression de compte.
  trash: {
    paths: ['M4 7h16M10 11v6M14 11v6M5 7l1 13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-13M9 7V4h6v3'],
  },
} as const satisfies Record<string, IconSpec>;

export type IconName = keyof typeof registry;

/** Tous les noms d'icônes disponibles — utile pour le catalogue de développement. */
export const ICON_NAMES = Object.keys(registry) as IconName[];

export type IconProps = {
  name: IconName;
  /**
   * Couleur résolue (hex/rgb), depuis useTheme().colors — react-native-svg n'hérite pas
   * de la couleur d'un parent (pas de « currentColor » fiable en React Native) : toujours
   * passer une valeur explicite.
   */
  color: string;
  size?: number;
  strokeWidth?: number;
  /**
   * Force le remplissage (ex. onglet actif de la tab bar), en overridant le réglage par
   * défaut du registre pour cette icône. Sur les tracés à segments ouverts (search,
   * calendar…), le remplissage perd un peu de détail — acceptable pour un onglet actif
   * (couleur + repère suffisent à distinguer l'état).
   */
  filled?: boolean;
};

/** Icône trait 1.8 (planche 07). */
export function Icon({ name, color, size = 24, strokeWidth = 1.8, filled }: IconProps) {
  // Le registre est en `as const` (pour que IconName reste un union littéral) : chaque entrée
  // n'a que ses propres clés déclarées. On l'élargit ici à IconSpec, structurellement compatible.
  const spec: IconSpec = registry[name];
  const isFilled = filled ?? spec.filled ?? false;

  const paths = useMemo(
    () =>
      spec.paths?.map((d, i) => (
        <Path
          key={i}
          d={d}
          fill={isFilled ? color : 'none'}
          stroke={isFilled ? 'none' : color}
          strokeWidth={isFilled ? 0 : strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )),
    [spec, isFilled, color, strokeWidth],
  );

  return (
    // Purement décorative : les parents interactifs (Button, TabBarButton…) portent déjà
    // l'accessibilityLabel réelle. react-native-svg traduit mal les props d'accessibilité
    // RN vers le DOM web (attribut brut invalide plutôt qu'un aria-*) — on n'en passe aucune.
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {spec.rects?.map((r, i) => (
        <Rect
          key={`r${i}`}
          x={r.x}
          y={r.y}
          width={r.width}
          height={r.height}
          rx={r.rx ?? 0}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      ))}
      {spec.circles?.map((c, i) => (
        <Circle
          key={`c${i}`}
          cx={c.cx}
          cy={c.cy}
          r={c.r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      ))}
      {paths}
    </Svg>
  );
}
