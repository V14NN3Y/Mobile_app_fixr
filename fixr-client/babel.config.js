module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    // Doit rester en dernier (Reanimated 4 passe par react-native-worklets).
    plugins: ['react-native-worklets/plugin'],
  };
};
