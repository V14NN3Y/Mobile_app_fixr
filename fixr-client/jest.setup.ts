/**
 * Mocks des modules natifs indisponibles sous Jest (pas de pont natif dans ce runtime) :
 * Reanimated, MMKV (Nitro), haptique. Les correspondances Jest de
 * @testing-library/react-native sont enregistrées automatiquement dès son import
 * (rien à faire ici — voir sa doc « Jest matchers »).
 *
 * Reanimated : le mock officiel (react-native-reanimated/mock) réexporte le vrai `./index`,
 * qui initialise réellement react-native-worklets (module natif, TurboModule) — plante sous
 * Jest. Mock manuel minimal, couvrant uniquement l'API utilisée par src/components/ui/
 * (useSharedValue/useAnimatedStyle/useDerivedValue/withTiming/withRepeat/cancelAnimation/
 * runOnJS/Easing/Animated.View) : pas d'animation réelle, juste de quoi rendre et interagir.
 */
jest.mock('react-native-reanimated', () => {
  // require() : une factory jest.mock ne peut pas fermer sur un import de haut de fichier
  // (hoisting Babel) — c'est le seul endroit du projet où c'est le cas.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');

  const useSharedValue = (initial: unknown) => ({ value: initial });
  const useDerivedValue = (factory: () => unknown) => ({ value: factory() });
  const useAnimatedStyle = (factory: () => Record<string, unknown>) => factory();
  const withTiming = (
    toValue: unknown,
    _config?: unknown,
    callback?: (finished: boolean) => void,
  ) => {
    callback?.(true);
    return toValue;
  };
  const withRepeat = (animation: unknown) => animation;
  const cancelAnimation = () => {};
  const runOnJS =
    <A extends unknown[], R>(fn: (...args: A) => R) =>
    (...args: A) =>
      fn(...args);
  const Easing = { linear: (t: number) => t };

  const Animated = { View, createAnimatedComponent: (Component: unknown) => Component };

  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue,
    useDerivedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    cancelAnimation,
    runOnJS,
    Easing,
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
    Rigid: 'rigid',
    Soft: 'soft',
  },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('react-native-mmkv', () => {
  class FakeMMKV {
    private store = new Map<string, string>();
    getString(key: string) {
      return this.store.get(key);
    }
    set(key: string, value: string | number | boolean) {
      this.store.set(key, String(value));
    }
    remove(key: string) {
      this.store.delete(key);
    }
  }
  return { createMMKV: () => new FakeMMKV() };
});
