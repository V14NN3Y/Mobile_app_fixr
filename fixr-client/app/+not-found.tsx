import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';

export default function NotFoundScreen() {
  const t = fr.common.notFound;

  return (
    <>
      <Stack.Screen options={{ title: t.title, headerShown: true }} />
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-5">
        <Text variant="title2">{t.description}</Text>
        <Link href="/" asChild>
          <Button variant="primary" size="md">
            {t.backHome}
          </Button>
        </Link>
      </View>
    </>
  );
}
