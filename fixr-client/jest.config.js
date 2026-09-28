/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Le préset jest-expo n'exempte que le paquet nommé exactement "react-native" (suivi d'un
  // "/") : "react-native-worklets", "react-native-svg"… (tiret après) n'étaient PAS couverts
  // et cassaient (ESM non transformé). "(-[\\w-]+)?" les inclut tous, une fois pour toutes.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-[\\w-]+)?|@react-native(-[\\w-]+)?|expo(-[\\w-]+)?|@expo(-[\\w-]+)?|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|nativewind|@gorhom/.*)/)',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
