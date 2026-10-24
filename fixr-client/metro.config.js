const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');

// getSentryExpoConfig() remplace getDefaultConfig() (drop-in, Lot 9) plutôt que d'empiler un
// withSentryConfig() séparé — recommandé par Sentry pour Expo, et n'a aucun effet tant que
// EXPO_PUBLIC_SENTRY_DSN est vide (src/lib/sentry.ts).
const config = getSentryExpoConfig(__dirname);

module.exports = withNativeWind(config, { input: './src/theme/global.css' });
