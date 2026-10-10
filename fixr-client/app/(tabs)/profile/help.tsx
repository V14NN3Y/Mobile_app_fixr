/**
 * Aide — pas de maquette dédiée, style de Profile.dc.html (docs/ECRANS.md). Reprend le
 * bandeau d'aide du Profil + une courte liste de questions fréquentes (texte statique, pas
 * de backend FAQ).
 */
import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

export default function Help() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.help;

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className="flex-row items-center gap-1.5 border-b border-border-subtle bg-bg px-2 pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel={fr.settings.backToProfile}
          className="h-11 w-11 items-center justify-center rounded-xl"
        >
          <Icon name="chevronLeft" size={22} color={colors.text} />
        </Pressable>
        <Text variant="title2" className="font-display">
          {t.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 22, paddingBottom: insets.bottom + 24 }}>
        <Text variant="body" tone="secondary">
          {t.intro}
        </Text>

        <View className="gap-2.5">
          <Text variant="title3" className="font-display">
            {t.faqTitle}
          </Text>
          <View className="overflow-hidden rounded-[20px] border border-border-subtle bg-surface">
            {t.faq.map((item, i) => (
              <View
                key={item.q}
                className={`gap-1.5 px-4 py-3.5 ${i < t.faq.length - 1 ? 'border-b border-border-subtle' : ''}`}
              >
                <Text variant="label" className="font-body-extrabold">
                  {item.q}
                </Text>
                <Text variant="caption" tone="secondary">
                  {item.a}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3 rounded-[22px] bg-primary p-[18px]">
          <View className="gap-1">
            <Text variant="label" tone="inherit" className="font-display text-on-primary" style={{ fontSize: 18 }}>
              {t.contactTitle}
            </Text>
            <Text variant="caption" tone="inherit" className="text-on-primary" style={{ opacity: 0.85 }}>
              {t.contactBody}
            </Text>
          </View>
          <Button variant="secondary" size="md" onPress={() => router.push('/messages/c_support')}>
            {t.writeToSupport}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
