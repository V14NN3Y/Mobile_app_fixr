# Kit de démarrage FIXR Client

Tout ce qu'il faut pour que Claude Code construise l'app mobile FIXR (Expo + React Native)
à partir des maquettes validées.

## Contenu

```
CLAUDE.md                 Règles du projet, lues automatiquement par Claude Code
tailwind.config.js        Thème NativeWind (généré depuis tokens.ts)
design/                   37 maquettes (1 fichier HTML par écran ou planche)
docs/ECRANS.md            Écran → route Expo Router → maquette → lot
docs/LOTS.md              Plan en 10 lots + prompt prêt à coller pour chacun
docs/MODELE-DONNEES.md    Tables Supabase, sécurité, temps réel (Lot 8)
src/theme/tokens.ts       Couleurs clair/sombre, typo, espacements, rayons, mouvement
src/theme/global.css      Variables CSS clair/sombre pour NativeWind
src/types/domain.ts       Types métier (artisan, réservation, message…)
src/mocks/data.ts         Données fictives identiques aux maquettes
```

## Démarrer

1. Installez **Node.js LTS** et **Git**, créez un compte **Expo** (expo.dev) et installez
   l'app **Expo Go** sur votre téléphone.
2. Installez **Claude Code** en suivant docs.claude.com (terminal), ou utilisez-le sur
   claude.ai/code avec un dépôt GitHub.
3. Créez un dossier `fixr-client`, décompressez-y ce kit, puis :
   ```
   cd fixr-client
   git init && git add . && git commit -m "chore: kit de démarrage FIXR"
   claude
   ```
4. Ouvrez `docs/LOTS.md`, passez Claude Code en mode plan (Maj+Tab) et collez le
   prompt du **Lot 0**. Validez le plan, laissez coder, testez, faites un commit.
   Puis Lot 1, Lot 2…

## Bon à savoir

- Les maquettes restent la référence visuelle : en cas de doute, demandez à Claude Code
  de comparer l'écran avec son fichier dans `design/`.
- Si vous modifiez la maquette dans le canevas, ré-exportez le fichier concerné dans `design/`.
- Si vous changez une couleur, modifiez `src/theme/tokens.ts` puis demandez à Claude Code
  de régénérer `global.css` et `tailwind.config.js`.
- Les photos d'artisans sont des emplacements vides dans les maquettes : prévoyez de vraies
  photos (avec l'accord des artisans) avant la mise en production.
- Les noms exacts des polices `@expo-google-fonts` et la configuration NativeWind dépendent
  des versions installées : le Lot 0 demande à Claude Code de les vérifier.
