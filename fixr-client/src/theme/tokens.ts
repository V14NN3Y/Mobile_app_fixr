/**
 * FIXR — design tokens (source de vérité).
 * Valeurs extraites de design/DesignSystem.dc.html.
 * Même nom de token en clair et en sombre : les écrans n'utilisent QUE ces noms.
 * global.css et tailwind.config.js doivent rester synchronisés avec ce fichier.
 */

export type ColorScheme = 'light' | 'dark';

export const colors = {
  light: {
    bg: '#F6F5F1',
    surface: '#FFFFFF',
    surfaceMuted: '#F2F0EB',
    border: '#E3E0D8',
    borderSubtle: '#ECE9E2',
    borderStrong: '#D9D5CC',

    text: '#12161F',
    textSecondary: '#4A515E',
    textTertiary: '#656B77',
    textDisabled: '#7A808B',

    primary: '#0B4F6C',
    primaryPressed: '#083B51',
    primarySoft: '#E3EEF2',
    onPrimary: '#FFFFFF',

    accent: '#C4511C', // maquette #C8531D, assombri pour atteindre 4,5:1 avec le blanc
    accentSoft: '#FBECE3',
    accentInk: '#9A3F14',
    onAccent: '#FFFFFF',

    success: '#1D7A4E',
    successSoft: '#E3F2EA',
    successInk: '#1D6B45',
    onSuccess: '#FFFFFF', // texte/icône sur success plein (SuccessCheck)

    warning: '#7A4F0C',
    warningSoft: '#FBF1DE',
    warningInk: '#5C3B08', // texte sur warningSoft

    danger: '#B02E28',
    dangerSoft: '#FBE7E5',
    dangerBorder: '#C2362F',
    dangerPressed: '#8E2520', // maquette : bouton destructif pressé
    dangerInk: '#8E2520', // texte sur dangerSoft
    fieldErrorBg: '#FFF8F7', // fond de champ en erreur
    onDanger: '#FFFFFF', // texte/icône sur danger plein (bouton destructif)

    rating: '#E0A21B',
    online: '#2EA067',
    disabledBg: '#E3E0D8',
    skeletonBase: '#EEECE6',
    skeletonHighlight: '#F7F6F2',
    scrim: 'rgba(18,22,31,0.45)',
    toastBg: '#12161F',
    toastText: '#FFFFFF',
    toastSuccess: '#7FE0AA',
    toastAction: '#F0A070',
    offlineBg: '#3B3F46',
    offlineText: '#FFFFFF',

    // Lot 6 : icône « sécurité » des notifications (design/Notifications.dc.html, seule
    // teinte de la planche à ne correspondre à aucun token existant).
    neutralSoft: '#ECE9E2',
    neutralInk: '#3A4250',
    // Lot 6 : bouton d'envoi du Chat à l'état « brouillon vide » (design/Chat.dc.html +
    // StatesA.dc.html col. 4) — bleu-gris étouffé, distinct de tout token existant.
    controlMuted: '#9FB6C0',
    onControlMuted: '#FFFFFF',

    // Flotte sur une carte (react-native-maps), pas sur le fond de l'app : doit rester
    // visuellement sombre quel que soit le thème, donc même valeur clair/sombre.
    inkSolid: '#12161F',
    onInkSolid: '#FFFFFF',
  },
  dark: {
    bg: '#0E1215',
    surface: '#161B20',
    surfaceMuted: '#1E252B',
    border: '#2A3238',
    borderSubtle: '#232B31',
    borderStrong: '#3A434C',

    text: '#F2F1EC',
    textSecondary: '#B7BCC4',
    textTertiary: '#8C939D',
    textDisabled: '#6B727C',

    primary: '#5FB3D4',
    primaryPressed: '#86C7E0',
    primarySoft: '#12303D',
    onPrimary: '#04232F',

    accent: '#F08A58',
    accentSoft: '#3A2217',
    accentInk: '#F4A77E',
    onAccent: '#1A0D06',

    success: '#4CC38A',
    successSoft: '#15301F',
    successInk: '#6FD3A0',
    onSuccess: '#1A0D06', // success sombre = teinte claire → encre foncée (comme onAccent/onDanger)

    warning: '#E6B04A',
    warningSoft: '#332812',
    warningInk: '#F0C978',

    danger: '#F07A72',
    dangerSoft: '#3A1B19',
    dangerBorder: '#F07A72',
    dangerPressed: '#D9635C',
    dangerInk: '#F4A19A',
    fieldErrorBg: '#2A1513',
    onDanger: '#1A0D06', // danger sombre = teinte claire → encre foncée (comme onAccent)

    rating: '#F2B93B',
    online: '#4CC38A',
    disabledBg: '#2A3238',
    skeletonBase: '#1E252B',
    skeletonHighlight: '#2A3238',
    scrim: 'rgba(0,0,0,0.6)',
    toastBg: '#F2F1EC',
    toastText: '#12161F',
    toastSuccess: '#1D6B45',
    toastAction: '#9A3F14',
    offlineBg: '#2A3238',
    offlineText: '#F2F1EC',

    // Pas de maquette sombre pour Chat/Notifications (ChatDark/NotificationsDark n'existent
    // pas) : valeurs choisies par cohérence avec le reste du système, pas extraites.
    neutralSoft: '#232B31', // = borderSubtle (dark) : même rôle de surface neutre discrète
    neutralInk: '#B7BCC4', // = textSecondary (dark) : même rôle de texte gris atténué
    controlMuted: '#4A5A66', // bleu-gris étouffé, cohérent avec primary (dark) désaturé
    onControlMuted: '#FFFFFF',

    inkSolid: '#12161F',
    onInkSolid: '#FFFFFF',
  },
} as const;

export type ColorToken = keyof typeof colors.light;

/** Teintes de catégorie : fond doux + encre (contraste ≥ 4,5:1). Jamais pour une action. */
export const categoryTints = {
  light: {
    plomberie: { bg: '#E3EEF2', ink: '#0B4F6C' },
    electricite: { bg: '#FBF1DE', ink: '#7A4F0C' },
    climatisation: { bg: '#DFF1F1', ink: '#0F5E5E' },
    peinture: { bg: '#FBECE3', ink: '#9A3F14' },
    menuiserie: { bg: '#F1E9E0', ink: '#6B4A2B' },
    serrurerie: { bg: '#EEE7F7', ink: '#5B3A8C' },
    nettoyage: { bg: '#E3F2EA', ink: '#1D6B45' },
    reparation: { bg: '#E9EBEF', ink: '#3A4250' },
  },
  dark: {
    plomberie: { bg: '#12303D', ink: '#8FD0EA' },
    electricite: { bg: '#332812', ink: '#E6B04A' },
    climatisation: { bg: '#0F2E2E', ink: '#6FD0D0' },
    peinture: { bg: '#3A2217', ink: '#F4A77E' },
    menuiserie: { bg: '#2E241B', ink: '#D9B48C' },
    serrurerie: { bg: '#2A2140', ink: '#C2A5EE' },
    nettoyage: { bg: '#15301F', ink: '#6FD3A0' },
    reparation: { bg: '#232A33', ink: '#B7BCC4' },
  },
} as const;

export type CategoryId = keyof typeof categoryTints.light;

/** Statuts de réservation → couleurs du badge (clé = token de couleur). */
export const statusTone = {
  pending: { bg: 'warningSoft', fg: 'warning', label: 'En attente' },
  quotes: { bg: 'warningSoft', fg: 'warning', label: 'Devis reçus' },
  confirmed: { bg: 'primarySoft', fg: 'primary', label: 'Confirmée' },
  on_the_way: { bg: 'accentSoft', fg: 'accentInk', label: 'En route' },
  on_site: { bg: 'successSoft', fg: 'successInk', label: 'Sur place' },
  in_progress: { bg: 'primarySoft', fg: 'primary', label: 'En cours' },
  done: { bg: 'successSoft', fg: 'successInk', label: 'Terminée' },
  cancelled: { bg: 'surfaceMuted', fg: 'textSecondary', label: 'Annulée' },
} as const satisfies Record<string, { bg: ColorToken; fg: ColorToken; label: string }>;

/** Espacements (base 4). Marge d'écran = space[5] (20). */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const radius = {
  sm: 8, // puces, vignettes
  md: 12, // petits boutons (44 / 40)
  lg: 14, // boutons 52, champs
  xl: 20, // cartes
  '2xl': 28, // sheets, grands panneaux
  full: 999, // avatars, pills
} as const;

export const size = {
  touchMin: 44,
  button: 52,
  buttonMd: 44,
  buttonSm: 40,
  input: 52,
  tabBar: 54, // + safe area bas
  screenPadding: 20,
} as const;

/**
 * Typographie. Les familles correspondent aux exports de @expo-google-fonts
 * (vérifier les noms exacts après installation).
 */
export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displaySemibold: 'BricolageGrotesque_600SemiBold',
  body: 'Manrope_500Medium',
  bodySemibold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyExtrabold: 'Manrope_800ExtraBold',
} as const;

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.64 },
  title1: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.56 },
  title2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, letterSpacing: -0.44 },
  title3: { fontFamily: fonts.display, fontSize: 18, lineHeight: 23, letterSpacing: -0.36 },
  bodyLg: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.bodySemibold, fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: fonts.bodyExtrabold, fontSize: 11, lineHeight: 14, letterSpacing: 0.44 },
  button: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 20 },
} as const;

/** Ombres (iOS) + elevation (Android). */
export const elevation = {
  e1: {
    shadowColor: '#12161F',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  e2: {
    shadowColor: '#12161F',
    shadowOpacity: 0.16,
    shadowRadius: 17,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  e3: {
    shadowColor: '#12161F',
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 24 },
    elevation: 12,
  },
} as const;

/** Mouvement. Courbes au format Reanimated Easing.bezier(x1, y1, x2, y2). */
export const motion = {
  duration: { press: 120, base: 200, sheet: 320, enter: 450, stagger: 40 },
  easing: {
    standard: [0.2, 0.8, 0.2, 1] as const,
    spring: [0.2, 1.4, 0.4, 1] as const,
  },
  pressScale: 0.98,
  tileScale: 0.95,
} as const;

export const theme = {
  colors,
  categoryTints,
  statusTone,
  space,
  radius,
  size,
  fonts,
  typography,
  elevation,
  motion,
};
export default theme;
