# FIXR Client — instructions pour Claude Code

FIXR est une marketplace mobile qui met en relation des clients et des artisans vérifiés
(plomberie, électricité, climatisation, peinture, menuiserie, serrurerie, nettoyage, réparation)
à Cotonou, Abomey-Calavi et Porto-Novo (Bénin). Ce dépôt contient **uniquement l'app Client**.
Pas d'app Artisan ni de back-office Admin ici.

## Sources de vérité

| Sujet | Fichier |
|---|---|
| Maquettes (1 fichier = 1 écran ou 1 planche) | `design/*.dc.html` |
| Carte écran → route → maquette → lot | `docs/ECRANS.md` |
| Plan de développement et prompts par lot | `docs/LOTS.md` |
| Couleurs, typo, espacements, rayons, mouvement | `src/theme/tokens.ts` (+ `design/DesignSystem.dc.html`) |
| Composants attendus | `design/Components.dc.html` |
| Navigation et arborescence | `design/Architecture.dc.html` |
| Données fictives (avant backend) | `src/mocks/data.ts`, types dans `src/types/domain.ts` |
| Modèle de données backend (Lot 8) | `docs/MODELE-DONNEES.md` |

Les maquettes sont du HTML : lis-les pour extraire les **valeurs exactes** (tailles, marges,
couleurs, textes, états). Ignore la balise `<script src="./support.js">`, les `{{...}}` et le
bloc `DCLogic` : c'est le moteur de prototypage, pas du code à reprendre. Les liens
`<a href="X.dc.html">` indiquent la navigation attendue.

## Stack (ne pas en changer sans me demander)

- Expo (dernier SDK stable) + TypeScript strict + **Expo Router** (routes typées)
- **NativeWind** (Tailwind) pour le style, branché sur `src/theme/tokens.ts` via variables CSS
- react-native-reanimated (animations), react-native-gesture-handler, @gorhom/bottom-sheet
- @shopify/flash-list (listes), expo-image (images)
- react-hook-form + zod (formulaires et validation)
- @tanstack/react-query (données serveur, cache, états loading/error)
- zustand (état client : flux de demande, préférences), react-native-mmkv (persistance)
- react-native-maps + expo-location (carte, position)
- expo-notifications (push), expo-haptics (retours tactiles)
- Polices : Bricolage Grotesque (titres) et Manrope (texte) via `@expo-google-fonts/*`
- Tests : jest-expo + @testing-library/react-native ; E2E plus tard avec Maestro
- Backend (Lot 8) : Supabase (Postgres, Auth OTP téléphone, Realtime, Storage, Edge Functions)

Avant d'ajouter une dépendance hors de cette liste : explique pourquoi et attends mon accord.
Installe les paquets natifs avec `npx expo install` (versions compatibles avec le SDK).

## Arborescence

```
app/                      # routes Expo Router (voir docs/ECRANS.md)
  (auth)/  (tabs)/  request/  artisan/[id].tsx  filters.tsx  notifications.tsx
src/
  theme/                  # tokens.ts, global.css, ThemeProvider, hook useTheme
  components/ui/          # Button, TextField, Chip, Badge, Avatar, Card, Tabs, Sheet,
                          # ConfirmDialog, Toast, Banner, Skeleton, EmptyState, RatingInput…
  components/domain/      # ArtisanCard, BookingCard, CategoryTile, MissionTimeline,
                          # MissionProgress, ChatBubble, QuickReplies, DateStrip, SlotPicker…
  features/<domaine>/     # auth, search, request, bookings, chat, notifications, profile
                          #   hooks (useQuery…), schémas zod, stores zustand, api
  lib/                    # api client, format (FCFA, dates), i18n, constantes
  mocks/                  # données fictives + faux client API (latence simulée)
  types/                  # types du domaine
```

## Règles de design (non négociables)

- **Jamais de couleur en dur** dans les écrans : uniquement les classes/tokens du thème.
  Chaque écran doit fonctionner en **clair et en sombre** dès sa création.
- Un seul bouton primaire (pétrole) par écran. Accent terre cuite = urgence / « en route » / badges.
- Zones tactiles ≥ 44×44 (`hitSlop` si besoin). Boutons principaux 52 px de haut.
- Marges d'écran 20 px. Respect des safe areas (`react-native-safe-area-context`).
  Pas de fausse barre de statut.
- Largeurs à tester : 360, 375, 390 (référence), 414. Pas de texte coupé ; titres 2 lignes max.
- Accessibilité : `accessibilityRole`, `accessibilityLabel` sur les boutons-icônes,
  `accessibilityState` (selected, disabled, checked), contraste AA, support du texte agrandi.
- Chaque écran important gère : **chargement (skeleton), vide, erreur, hors connexion,
  succès**, bouton désactivé et soumission en cours (voir `design/StatesA|B.dc.html`).
- Toute action importante a un retour visuel (toast, changement d'état, haptique légère).
- Animations : rapides et discrètes (`tokens.motion`). Respecter « Réduire les animations »
  (`AccessibilityInfo.isReduceMotionEnabled`) → fondu simple, pas de boucle.
- Clavier : `inputMode` adapté (tel, numeric, email), `returnKeyType="next"`,
  pied de page au-dessus du clavier (`KeyboardAvoidingView` / keyboard-controller).

## Contenu et langue

- Toute l'interface est en **français**, ton clair, chaleureux, direct, rassurant.
  Reprendre les textes des maquettes mot pour mot sauf demande contraire.
- Centraliser les textes dans `src/lib/i18n/fr.ts` (prépare d'autres langues plus tard).
- Montants : `formatFCFA(22500)` → `22 500 FCFA` (espace fine insécable comme séparateur).
- Dates : `lun. 28 sept.`, heures `14:00 – 16:00`. Fuseau Africa/Porto-Novo.
- Téléphones : `+229 01 97 45 12 36` (numéros béninois à 10 chiffres commençant par 01).

## Données

- Jusqu'au Lot 8, tout passe par un **faux client API** (`src/mocks/api.ts`) qui renvoie
  `src/mocks/data.ts` avec une latence aléatoire (300–900 ms) et un taux d'erreur réglable
  pour tester les états d'erreur. Les écrans ne lisent **jamais** `data.ts` directement :
  ils passent par des hooks React Query (`features/*/hooks.ts`), pour que le branchement
  Supabase ne touche pas l'UI.
- Identifiants de réservation au format `FX-12345`.

## Méthode de travail

1. Commence chaque lot en **mode plan** : liste des fichiers à créer/modifier, composants
   réutilisés, questions ouvertes. N'écris pas de code avant ma validation.
2. Travaille écran par écran ; après chaque écran, compare avec son fichier `design/` et
   liste les écarts restants.
3. Lance `npx tsc --noEmit`, le lint et les tests avant de dire qu'un lot est terminé.
4. Petits commits clairs en français (`feat(recherche): filtres et tri`).
5. Si une maquette est ambiguë ou impossible en natif, dis-le et propose une option,
   ne l'invente pas en silence.

## Commandes

```
npx expo start            # dev (Expo Go ou dev build)
npx tsc --noEmit          # types
npm run lint              # eslint (expo lint)
npm test                  # jest
```
