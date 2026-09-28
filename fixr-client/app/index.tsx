/**
 * Route provisoire du Lot 0 : redirige vers le catalogue de composants.
 * Remplacée au Lot 1 par la redirection réelle (auth)/welcome ↔ (tabs), selon la session.
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/dev/catalogue" />;
}
