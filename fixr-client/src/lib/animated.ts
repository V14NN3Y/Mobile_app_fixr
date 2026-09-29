/**
 * Composants Reanimated enregistrés pour NativeWind — nécessaire sur toutes les
 * plateformes, mais SEULE l'absence casse silencieusement le rendu sur web :
 * `View`/`Text`/`Pressable` importés directement de 'react-native' sont reconnus
 * automatiquement par le plugin Babel de NativeWind, mais tout composant obtenu via
 * Animated.createAnimatedComponent(...) (ou Animated.View de Reanimated lui-même) est un
 * composant « personnalisé » de son point de vue : sans cssInterop(), son className est
 * silencieusement ignoré (aucune erreur, juste aucun style appliqué) — constaté en testant
 * un rendu web réel de Button, pas supposé. cssInterop() est l'API publique documentée de
 * NativeWind pour ce cas précis ; sûre à utiliser aussi côté natif.
 */
import { cssInterop } from 'nativewind';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

export const AnimatedView = cssInterop(Animated.View, { className: 'style' });
export const AnimatedPressable = cssInterop(Animated.createAnimatedComponent(Pressable), {
  className: 'style',
});
