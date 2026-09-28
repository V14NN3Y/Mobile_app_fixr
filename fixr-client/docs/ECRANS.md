# Carte des écrans FIXR Client

Chaque écran a une maquette de référence dans `design/`. Route = chemin Expo Router sous `app/`.
« Présentation » : `stack` (poussé), `tab` (racine d'onglet), `modal` (plein écran), `sheet` (formSheet).

## Référence (pas des écrans)

| Planche | Fichier | Sert à |
|---|---|---|
| Architecture de navigation | `design/Architecture.dc.html` | Arborescence, flux, liens profonds |
| Design system — Fondations | `design/DesignSystem.dc.html` | Tokens (déjà dans `src/theme/tokens.ts`) |
| Bibliothèque de composants | `design/Components.dc.html` | API visuelle des composants `ui/` et `domain/` |
| États système A | `design/StatesA.dc.html` | Chargement, vide, erreur, hors connexion |
| États système B | `design/StatesB.dc.html` | Soumission, confirmation destructive, toast succès, paiement échoué |
| Profil artisan — états | `design/ArtisanStates.dc.html` | Indisponible, incomplet, déjà réservé, erreur |

## Écrans

| # | Écran | Route | Présentation | Maquette | Lot |
|---|---|---|---|---|---|
| 01 | Bienvenue | `(auth)/welcome` | stack | `Main.dc.html` | 2 |
| 02 | Onboarding (3 slides) | `(auth)/onboarding` | stack (PagerView) | `Onboarding1/2/3.dc.html` | 2 |
| 03 | Connexion | `(auth)/login` | stack | `Login.dc.html` | 2 |
| 03b | Code SMS | `(auth)/verify-otp` | stack | `Otp.dc.html` | 2 |
| 04 | Inscription | `(auth)/signup` | stack | `Signup.dc.html` + erreurs `SignupErrors.dc.html` | 2 |
| 05 | Accueil | `(tabs)/index` | tab | `Home.dc.html` (sombre : `HomeDark.dc.html`) | 3 |
| 06 | Recherche | `(tabs)/search/index` | tab | `Search.dc.html` | 3 |
| 07 | Résultats liste | `(tabs)/search/results` | stack | `Results.dc.html` | 3 |
| 07b | Résultats carte | `(tabs)/search/results?view=map` | stack | `ResultsMap.dc.html` | 3 |
| 08 | Filtres | `filters` | sheet | `Filters.dc.html` | 3 |
| 09 | Profil artisan | `artisan/[id]` | stack | `ArtisanProfile.dc.html` + `ArtisanStates.dc.html` | 3 |
| 10 | Demande · Besoin | `request/need` | modal | `RequestNeed.dc.html` | 4 |
| 11 | Demande · Adresse | `request/address` | modal (pile interne) | `RequestAddress.dc.html` | 4 |
| 12 | Demande · Date | `request/date` | modal (pile interne) | `RequestDate.dc.html` | 4 |
| 13 | Demande · Confirmation | `request/confirm` | modal (pile interne) | `RequestConfirm.dc.html` | 4 |
| 13b | Demande envoyée | `request/success` | modal (pile interne) | `RequestSuccess.dc.html` | 4 |
| 14 | Réservations | `(tabs)/bookings/index` | tab | `Bookings.dc.html` | 5 |
| 15 | Détail réservation | `(tabs)/bookings/[id]/index` | stack | `BookingDetail.dc.html` | 5 |
| 16 | Mission en cours | `(tabs)/bookings/[id]/live` | stack | `MissionLive.dc.html` (sombre : `MissionDark.dc.html`) | 5 |
| 17 | Rapport d'intervention | `(tabs)/bookings/[id]/report` | stack | `Report.dc.html` | 5 |
| 18 | Évaluation | `(tabs)/bookings/[id]/review` | stack | `Review.dc.html` | 5 |
| 19 | Conversations | `(tabs)/messages/index` | tab | `Messages.dc.html` | 6 |
| 20 | Chat | `(tabs)/messages/[threadId]` | stack | `Chat.dc.html` | 6 |
| 21 | Notifications | `notifications` | stack | `Notifications.dc.html` | 6 |
| 22 | Profil | `(tabs)/profile/index` | tab | `Profile.dc.html` | 7 |
| 23 | Paramètres | `(tabs)/profile/settings` | stack | `Settings.dc.html` | 7 |
| — | Mes adresses | `(tabs)/profile/addresses` | stack | à dériver de `StatesB.dc.html` (col. 3) + `RequestAddress.dc.html` | 7 |
| — | Moyens de paiement, Favoris, Mes avis, Aide | `(tabs)/profile/*` | stack | pas de maquette : suivre le style de `Profile.dc.html` | 7 |

## Barre d'onglets

Accueil · Rechercher · Réservations (badge = missions en cours) · Messages (badge = non lus) · Profil.
Masquée dans le flux `request/*`, sur `artisan/[id]`, `bookings/[id]/live` et le chat
(écrans avec actions fixes en bas).

## Liens profonds (notifications push)

| Lien | Écran |
|---|---|
| `fixr://bookings/{id}` | 15 Détail |
| `fixr://bookings/{id}/live` | 16 Mission en cours |
| `fixr://bookings/{id}/report` | 17 Rapport |
| `fixr://bookings/{id}/review` | 18 Évaluation |
| `fixr://messages/{threadId}` | 20 Chat |
| `fixr://profile/settings` | 23 Paramètres |

## Points d'entrée du flux de demande

Accueil (« Décrire mon besoin », « Réserver à nouveau »), Résultats (« Demander »),
Profil artisan (« Demander une intervention » → artisan présélectionné),
Recherche sans résultat, Réservations (« + Demande », « Refaire une demande »).
Après succès : `router.replace` vers Réservations (onglet À venir).
