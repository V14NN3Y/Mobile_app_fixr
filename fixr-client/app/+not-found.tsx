import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Introuvable', headerShown: true }} />
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-5">
        <Text variant="title2">Cet écran n’existe pas</Text>
        <Link href="/" asChild>
          <Button variant="primary" size="md">
            Retour à l’accueil
          </Button>
        </Link>
      </View>
    </>
  );
}
