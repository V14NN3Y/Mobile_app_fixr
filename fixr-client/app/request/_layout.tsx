/**
 * Pile interne du flux de demande. La présentation modale plein écran est posée sur la
 * route "request" elle-même depuis app/_layout.tsx (Stack.Screen options={{presentation:'modal'}}),
 * pas ici.
 */
import { Stack } from 'expo-router';

export default function RequestLayout() {
  return <Stack screenOptions={{ headerShown: true }} />;
}
