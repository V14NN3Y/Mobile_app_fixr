# Checklist de publication — Play Store & App Store

Référence pour la mise en ligne de FIXR Client (Lot 9). Ne couvre que l'app Client
(`com.fixr.client`) — pas d'app Artisan/Admin dans ce dépôt.

## État actuel (déjà en place, vérifié dans ce dépôt)

- **Icône** : `assets/images/icon.png` (iOS), `android-icon-foreground.png` +
  `android-icon-monochrome.png` (Android adaptive icon, fond `#0B4F6C`) — logo croix
  pétrole/terre cuite de `design/DesignSystem.dc.html`, en place depuis le Lot 1.
- **Splash screen** : `assets/images/splash-icon.png`, fond `#F6F5F1` (clair) /
  `#0E1215` (sombre) — `expo-splash-screen`, déjà configuré.
- **Identifiants de bundle** : `com.fixr.client` (iOS `bundleIdentifier` et Android
  `package`), identiques, en place depuis le Lot 1.
- **Suppression de compte** : Profil → Paramètres → « Supprimer mon compte »
  (`app/(tabs)/profile/settings.tsx`, Edge Function `delete-account` du Lot 8) —
  conforme à l'exigence Apple (depuis 2022) et Google Play (depuis 2023) de proposer
  la suppression du compte **dans l'app**, pas seulement par email/web.
- **EAS** : projet lié (`extra.eas.projectId` dans `app.json`), `eas.json` avec 3
  profils (`development`, `preview`, `production`), EAS Update configuré
  (`updates.url`, `runtimeVersion`).

## À faire avant soumission (hors de ce dépôt)

### 1. Comptes développeur
- [ ] Compte Google Play Console (25 $ US, paiement unique).
- [ ] Compte Apple Developer Program (99 $ US/an).

### 2. Politique de confidentialité
**Aucune page de politique de confidentialité n'existe actuellement** — obligatoire
sur les deux stores avant soumission. Doit couvrir au minimum, vu les données
réellement collectées par cette app (`docs/MODELE-DONNEES.md`) :
- Identité (nom, téléphone, email, photo de profil).
- Localisation (adresses enregistrées, position pour la recherche d'artisans à
  proximité et le suivi de mission en direct).
- Contenu utilisateur (photos jointes aux demandes/rapports, messages de chat).
- Paiement (une fois le point 1 du Lot 9 implémenté — méthode choisie avec
  ID MONEY ou un agrégateur Mobile Money).
- Sous-traitants : Supabase (hébergement/BDD), l'agrégateur de paiement retenu,
  Sentry (erreurs), PostHog (analytique) une fois les comptes créés.
- Procédure de suppression des données (renvoie vers « Supprimer mon compte »).
- Doit être hébergée à une URL publique stable (ex. une page statique séparée du
  dépôt) — à renseigner dans Play Console et App Store Connect.

### 3. Captures d'écran
Formats minimums à fournir aux deux stores, **clair et sombre** (CLAUDE.md :
l'app doit fonctionner dans les deux) :

| Store | Format | Écrans suggérés |
|---|---|---|
| Play Store | téléphone 16:9 ou 9:16, 2–8 images | Accueil, Résultats de recherche, Mission en direct, Chat, Profil artisan |
| App Store | 6,9" (obligatoire) + 6,5" si pas de fallback | mêmes écrans |

Écrans recommandés (déjà stables, données de seed réalistes) : Accueil
(`app/(tabs)/index.tsx`), Résultats (`app/(tabs)/search/results.tsx`), Mission en
direct (`app/(tabs)/bookings/[id]/live.tsx`), Chat (`app/(tabs)/messages/[threadId].tsx`),
Profil artisan (`app/artisan/[id].tsx`).

### 4. Classification de contenu
- **Google Play** : questionnaire IARC (Play Console → Contenu de l'app →
  Classification du contenu). Pour une app de mise en relation avec paiement et
  localisation : prévoir de déclarer la collecte de localisation précise et de
  données de paiement.
- **Apple** : App Privacy (App Store Connect → App Privacy) — déclarer les mêmes
  catégories de données (identité, localisation, contenu utilisateur, paiement,
  données financières) et si elles sont liées à l'identité de l'utilisateur
  (c'est le cas ici : compte authentifié par téléphone).

### 5. Coordonnées de support
**Aucune adresse de support n'est définie dans le dépôt** (`src/lib/i18n/fr.ts`
n'en contient pas, l'écran Aide `app/(tabs)/profile/help.tsx` n'en affiche pas
non plus). Les deux stores exigent un moyen de contact (email ou URL) visible sur
la fiche store. À définir et, idéalement, à faire apparaître aussi dans l'écran
Aide de l'app.

### 6. Fiche store (textes)
- Nom (≤ 30 car. Play / ≤ 30 car. App Store) : `FIXR`.
- Description courte/longue : à rédiger à partir du texte d'accueil déjà en place
  (`fr.auth.welcome`, `src/lib/i18n/fr.ts`) — « Trouvez un artisan fiable près de
  chez vous. Plombiers, électriciens, frigoristes… vérifiés, notés et suivis en
  temps réel à Cotonou, Calavi et Porto-Novo. »
- Catégorie : Style de vie ou Outils/Utilitaires (Google) ; Lifestyle ou Utilities
  (Apple) — à trancher selon le positionnement souhaité.

## Builds

```bash
# Preview (test interne, installable directement, déjà vérifié ce lot)
eas build --profile preview --platform android

# Production (soumission aux stores)
eas build --profile production --platform android
eas build --profile production --platform ios   # nécessite un compte Apple Developer configuré

# Soumission automatisée (après un premier passage manuel la première fois)
eas submit --profile production --platform android
eas submit --profile production --platform ios
```

`eas.json`'s profil `production` a `autoIncrement: true` (le numéro de build
s'incrémente automatiquement à chaque soumission) et `SENTRY_DISABLE_AUTO_UPLOAD=true`
tant qu'aucun compte Sentry n'est configuré (sinon `eas.json` pourra être mis à jour
avec `organization`/`project` Sentry réels pour réactiver l'upload des sourcemaps).

## Portée volontairement hors de ce lot

- **Paiement (point 1 du Lot 9)** : en pause, en attente de votre retour sur
  l'agrégateur Mobile Money (voir le plan du Lot 9). La politique de
  confidentialité et la classification de contenu devront être mises à jour une
  fois ce point implémenté (collecte de données de paiement).
- **Comptes Sentry/PostHog réels** : le code est prêt (DSN/clé vide = inactif),
  les comptes restent à créer de votre côté.
