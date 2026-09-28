// Config ESLint (flat) — base eslint-config-expo, + prettier pour désactiver les règles
// de mise en forme (Prettier gère le style, ESLint le reste).
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const { defineConfig, globalIgnores } = require('eslint/config');

module.exports = defineConfig([
  globalIgnores(['dist/*', 'node_modules/*', '.expo/*', 'design/*', 'scripts/*.mjs']),
  expoConfig,
  prettierConfig,
  {
    rules: {
      // Faux positif systémique avec Reanimated : muter `sharedValue.value` est la façon
      // documentée de déclencher une animation, pas un état React que le hook devrait geler.
      // Utilisé dans tout le projet (CLAUDE.md) — désactivé globalement plutôt que ligne à ligne.
      'react-hooks/immutability': 'off',
    },
  },
]);
