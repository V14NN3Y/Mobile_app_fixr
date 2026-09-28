# Plan de développement FIXR Client — 10 lots

Un lot = une session Claude Code. Chaque lot se termine par une app qui démarre, sans erreur
de types, et un commit.

## Routine pour chaque lot

1. Nouvelle session (ou `/clear`) pour repartir d'un contexte propre.
2. Passer en **mode plan** (Maj+Tab dans Claude Code), coller le prompt du lot.
3. Relire le plan. Corriger ce qui ne vous convient pas **avant** de valider.
4. Laisser coder. Tester sur votre téléphone (Expo Go ou dev build) en clair **et** en sombre.
5. Demander : « Compare chaque écran du lot avec sa maquette dans design/ et liste les écarts. »
6. Corriger, puis : « Lance tsc, lint et les tests, puis fais le commit du lot. »

Astuce : si un écran vous déplaît, décrivez l'écart précisément (« le bouton est trop bas,
la marge doit être de 20 px comme dans design/Home.dc.html ») plutôt que « refais-le ».

---

## Lot 0 — Fondations

**Maquettes** : `DesignSystem.dc.html`, `Components.dc.html`

```
Lis CLAUDE.md, src/theme/tokens.ts, design/DesignSystem.dc.html et design/Components.dc.html.

Objectif du Lot 0 :
1. Initialise un projet Expo (TypeScript strict, Expo Router) dans ce dossier, SANS écraser
   CLAUDE.md, design/, docs/, src/theme/, src/mocks/, src/types/, tailwind.config.js.
2. Installe et configure NativeWind en suivant sa documentation officielle pour la version
   installée. Branche src/theme/global.css et tailwind.config.js (déjà générés depuis tokens.ts).
   Mets en place le choix de thème Clair / Sombre / Système (store zustand persistant MMKV).
3. Charge les polices Bricolage Grotesque (600, 700) et Manrope (500, 600, 700, 800) via
   @expo-google-fonts ; garde l'écran de démarrage tant qu'elles ne sont pas prêtes.
   Vérifie que les noms de familles correspondent à tokens.fonts et tailwind.config.js.
4. Crée les composants de base dans src/components/ui/ selon design/Components.dc.html :
   Text (variantes display/title1/title2/title3/bodyLg/body/label/caption/micro), Button
   (primary/secondary/tertiary/destructive ; tailles 52/44/40 ; états pressé, chargement,
   désactivé ; icône seule), TextField (label, aide, erreur, icône, désactivé, focus),
   Chip, Segmented, Tabs soulignés, Switch, Checkbox, Radio, Badge (statuts via
   tokens.statusTone + niveaux de vérification), Avatar (initiales, tailles, pastille en ligne,
   pile), Card, Skeleton (shimmer), EmptyState, Banner (info/warning/error/offline),
   Toast (provider global + useToast), ConfirmDialog, Sheet (@gorhom/bottom-sheet),
   ProgressBar, Stepper, RatingInput, Icon (jeu d'icônes trait 1.8 de la planche 07).
5. Crée un écran de développement app/dev/catalogue.tsx qui affiche tous ces composants
   dans tous leurs états, avec un interrupteur clair/sombre.
6. Configure ESLint (expo lint), Prettier, jest-expo + Testing Library, et écris des tests
   pour Button (états) et formatFCFA (src/lib/format.ts : 22500 → « 22 500 FCFA »).

Commence par un plan détaillé (fichiers, dépendances avec versions compatibles SDK,
questions). N'écris pas de code avant ma validation.
```

**Critères d'acceptation** : l'app démarre sur Android et iOS ; le catalogue est identique à
`Components.dc.html` en clair et proche de la palette sombre ; aucune couleur en dur (`grep -r "#[0-9A-F]\{6\}" app src/components` ne renvoie que tokens/global.css) ; tests verts.

---

## Lot 1 — Squelette de navigation

**Maquettes** : `Architecture.dc.html` + `docs/ECRANS.md`

```
Lis docs/ECRANS.md et design/Architecture.dc.html.

Crée toute l'arborescence Expo Router décrite dans docs/ECRANS.md, avec pour chaque route
un écran provisoire (titre + liens vers les écrans suivants du parcours) :
- groupe (auth) en Stack ; groupe (tabs) avec la barre d'onglets fidèle à
  design/Components.dc.html (icônes, onglet actif pétrole avec repère 3 px, badges terre cuite,
  hauteur 54 + safe area) ;
- request/* en modal plein écran avec sa propre pile ; filters en formSheet ;
- redirection : pas de session → (auth)/welcome, session → (tabs). Session fictive
  stockée dans un store zustand persistant (MMKV) pour l'instant ;
- liens profonds fixr:// listés dans docs/ECRANS.md ;
- barre d'onglets masquée sur les écrans indiqués.
Ajoute un faux client API src/mocks/api.ts (latence 300–900 ms, taux d'erreur réglable
via une variable) et le QueryClientProvider. Plan d'abord.
```

**Critères** : on peut parcourir tous les écrans provisoires ; retour arrière cohérent (bouton
et geste) ; un lien `fixr://bookings/FX-24817/live` ouvre le bon écran.

---

## Lot 2 — Bienvenue, onboarding, compte

**Maquettes** : `Main`, `Onboarding1/2/3`, `Login`, `Otp`, `Signup`, `SignupErrors`

```
Implémente les écrans du groupe (auth) en reproduisant fidèlement design/Main.dc.html,
design/Onboarding1/2/3.dc.html (un seul écran avec pager, indicateur animé, Passer, Suivant),
design/Login.dc.html (onglets Téléphone / E-mail), design/Otp.dc.html (6 cases, collage et
autofill SMS : textContentType="oneTimeCode" / autoComplete="sms-otp", renvoi du code avec
compte à rebours), design/Signup.dc.html et design/SignupErrors.dc.html.
Formulaires : react-hook-form + zod, messages d'erreur exactement comme la maquette,
bandeau récapitulatif des erreurs, bouton désactivé tant que les CGU ne sont pas acceptées,
état de soumission (spinner) et erreur réseau.
L'illustration de l'écran Bienvenue et des slides : reproduis-les avec react-native-svg
(formes simples de la maquette), animations d'entrée discrètes (Reanimated).
L'authentification reste fictive (code 482917 accepté) derrière une interface
src/features/auth/api.ts que l'on branchera sur Supabase au Lot 8. Plan d'abord.
```

**Critères** : parcours complet Bienvenue → Onboarding → Inscription → Code → Accueil ; clavier
ne masque jamais le bouton ; lecteur d'écran annonce les erreurs.

---

## Lot 3 — Accueil et découverte

**Maquettes** : `Home`, `HomeDark`, `Search`, `Results`, `ResultsMap`, `Filters`, `ArtisanProfile`, `ArtisanStates`

```
Implémente l'Accueil (design/Home.dc.html, version sombre design/HomeDark.dc.html), la
Recherche (design/Search.dc.html : suggestions en direct par type Service/Artisan/Lieu,
historique supprimable, demandes fréquentes, état « aucun résultat » avec lien vers la demande),
les Résultats en liste (design/Results.dc.html : tri en bottom sheet, puces de filtres actifs
retirables, cartes artisan, chargement progressif avec skeleton en fin de liste via FlashList)
et en carte (design/ResultsMap.dc.html : react-native-maps, marqueurs note, carte artisan en
bas, « Rechercher dans cette zone », recentrer), les Filtres (design/Filters.dc.html : compteur
« Afficher N artisans » recalculé en direct), et le Profil artisan (design/ArtisanProfile.dc.html
avec bouton fixe, favoris animé) incluant les 4 états de design/ArtisanStates.dc.html.
Crée les composants domaine ArtisanCard, CategoryTile, RatingSummary, AvailabilityStrip.
Toutes les données via hooks React Query sur le faux client API. Gère chargement, vide,
erreur (design/StatesA.dc.html col. 1 et 3) sur chaque écran. Plan d'abord.
```

**Critères** : tri et filtres modifient réellement la liste ; carte fonctionnelle sur Android ;
profil artisan correct pour Koffi (complet), Rachidi (incomplet) et un artisan indisponible.

---

## Lot 4 — Demande d'intervention (4 étapes)

**Maquettes** : `RequestNeed`, `RequestAddress`, `RequestDate`, `RequestConfirm`, `RequestSuccess`, `StatesB` (col. 1)

```
Implémente le flux modal request/* : Besoin → Adresse → Date → Confirmation → Succès, fidèle
aux maquettes design/Request*.dc.html. État partagé dans un store zustand (persisté : un
brouillon survit à la fermeture de l'app), validation zod par étape, stepper en haut,
bouton Continuer désactivé tant que l'étape est invalide.
- Besoin : catégories, titre (compteur 60), description, photos/vidéo (expo-image-picker,
  6 max, compression), urgence, budget facultatif.
- Adresse : adresses enregistrées, position actuelle (expo-location, gérer le refus de
  permission), recherche, ajout, complément, instructions d'accès, mini-carte.
- Date : raccourcis Aujourd'hui / Demain / Autre date, bandeau de jours, créneaux avec
  disponibilité (passé, complet, dernier artisan), récapitulatif en pied de page.
- Confirmation : résumé avec liens Modifier vers chaque étape, encart « À savoir ».
- Soumission : état de design/StatesB.dc.html (colonne 1), anti double-envoi, erreur réseau
  avec réessai. Succès : animation du check, numéro FX- copiable, puis Réservations.
Entrées possibles : Accueil, Résultats, Profil artisan (artisan présélectionné → pas de
recherche ouverte). Plan d'abord.
```

**Critères** : on peut quitter et reprendre une demande ; retour arrière entre étapes conserve
les saisies ; la réservation créée apparaît dans « À venir ».

---

## Lot 5 — Réservations et suivi de mission

**Maquettes** : `Bookings`, `BookingDetail`, `MissionLive`, `MissionDark`, `Report`, `Review`, `StatesB` (col. 2 et 4)

```
Implémente Réservations (design/Bookings.dc.html : 4 onglets avec compteurs, cartes, CTA
contextuels, état vide de design/StatesA.dc.html col. 2), le Détail (design/BookingDetail.dc.html :
timeline MissionTimeline, artisan, détails, prix, annulation avec ConfirmDialog + motif +
toast « Annuler » pendant 5 s, signalement), la Mission en cours (design/MissionLive.dc.html :
carte avec trajet et marqueur animé, ETA, progression 5 étapes, code de mission, appel
via Linking tel:, contacter, modifier, partager le suivi, aide ; version sombre
design/MissionDark.dc.html), le Rapport (design/Report.dc.html : avant/après, matériel,
total, garantie, confirmer la fin, signaler, télécharger en PDF via expo-print + partage)
et l'Évaluation (design/Review.dc.html : note, critères, commentaire, photo, envoi, écran merci).
Pour la démo, simule l'avancée de la mission FX-24817 (en route → sur place → travaux →
terminé) côté faux API, comme dans la maquette. Plan d'abord.
```

**Critères** : annuler FX-24990 la déplace dans « Annulées » ; la mission FX-24817 va jusqu'au
rapport puis à l'avis ; la note publiée met à jour le profil artisan (en local).

---

## Lot 6 — Messages et notifications

**Maquettes** : `Messages`, `Chat`, `Notifications`, `StatesA` (col. 4)

```
Implémente Conversations (design/Messages.dc.html : recherche, filtre Non lues, badges,
en ligne, statut Lu), le Chat (design/Chat.dc.html : carte mission épinglée, messages
système, bulles, envoi photo, réponses rapides, statuts envoyé → reçu → lu, indicateur
« écrit… », file d'attente hors connexion comme design/StatesA.dc.html col. 4) et
Notifications (design/Notifications.dc.html : groupes par date, non lues, Tout marquer
comme lu, filtre, état vide, clic = lien profond). Le badge de l'onglet Messages et la
pastille de la cloche de l'Accueil se mettent à jour. Prépare expo-notifications (demande
de permission au bon moment, pas au lancement) sans envoi réel. Plan d'abord.
```

**Critères** : un message envoyé hors connexion part au retour du réseau ; toucher une
notification ouvre le bon écran.

---

## Lot 7 — Profil, paramètres, états et finitions

**Maquettes** : `Profile`, `Settings`, `StatesA`, `StatesB`

```
Implémente Profil (design/Profile.dc.html), Paramètres (design/Settings.dc.html : biométrie via
expo-local-authentication, notifications, apparence Clair/Sombre/Système reliée au thème,
langue, déconnexion en sheet, suppression de compte avec case de confirmation) et les écrans
secondaires Mes adresses (toast de succès de design/StatesB.dc.html col. 3), Moyens de paiement,
Favoris, Mes avis, Aide, dans le style de Profile.dc.html.
Puis passe en revue TOUTE l'app : chaque écran doit gérer chargement, vide, erreur, hors
connexion (NetInfo + bannière globale), soumission et succès ; textes centralisés dans
src/lib/i18n/fr.ts ; accessibilité (rôles, labels, taille de texte 130 %) ; « Réduire les
animations ». Teste en 360 et 414 de large. Ajoute 3 parcours Maestro (inscription, demande,
suivi → avis). Donne-moi la liste des écarts restants avec les maquettes. Plan d'abord.
```

**Critères** : aucun écran blanc ou bloqué quand le faux API renvoie une erreur ; parcours
Maestro verts.

---

## Lot 8 — Backend Supabase

**Référence** : `docs/MODELE-DONNEES.md`

```
Lis docs/MODELE-DONNEES.md et src/types/domain.ts.
1. Crée le projet Supabase en local (supabase CLI), les migrations SQL, les politiques RLS,
   les buckets Storage (photos de demandes, rapports, avatars) et un seed reprenant
   src/mocks/data.ts.
2. Écris les Edge Functions listées (create-booking, accept-quote, cancel-booking,
   validate-report, search-artisans) avec validation des transitions de statut.
3. Remplace le faux client API par Supabase derrière les mêmes hooks (l'UI ne doit pas
   changer). Garde les mocks activables par variable d'environnement.
4. Authentification : OTP par SMS sur le numéro de téléphone. Propose-moi les fournisseurs
   SMS compatibles avec Supabase qui couvrent le Bénin avant de configurer.
5. Realtime : messages, positions artisan, événements de réservation, notifications.
Plan d'abord, en commençant par les migrations et la RLS.
```

**Critères** : deux comptes de test ne voient jamais les données l'un de l'autre ; tout
fonctionne en réseau lent (tester avec la limitation réseau du simulateur).

---

## Lot 9 — Paiement, notifications push, publication

```
1. Paiement Mobile Money : compare pour moi FedaPay, KkiaPay et un autre agrégateur couvrant
   le Bénin (frais, SDK/API, webhooks, délais de versement, environnement de test) et
   attends mon choix. Puis implémente start-payment + webhook, l'écran de paiement et
   l'échec de design/StatesB.dc.html col. 4 (aucun montant débité, réessayer, espèces).
2. Notifications push : Expo Push via Edge Function send-push, enregistrement des tokens,
   liens profonds ; tester chaque type de docs/ECRANS.md.
3. Monitoring : Sentry (erreurs) et PostHog (analytique, événements clés du tunnel de demande).
4. EAS : profils development / preview / production, icône et splash (logo FIXR de
   design/DesignSystem.dc.html), identifiants de bundle, EAS Update, checklist de
   publication Play Store et App Store (captures, confidentialité, suppression de compte).
Plan d'abord.
```

**Critères** : un paiement de test aboutit et un échec est bien géré ; une build preview
s'installe sur un Android d'entrée de gamme et reste fluide.

---

## Après le Lot 9

- **App Artisan** (accepter des demandes, envoyer des devis, partager sa position,
  rédiger le rapport) : nécessaire pour que le suivi et les devis soient réels.
- **Back-office Admin** (vérification des artisans, modération des avis, litiges, paiements).
- Mêmes tables Supabase ; réutiliser `src/theme` et `src/components/ui` dans un monorepo
  (pnpm workspaces ou Turborepo) le moment venu.
