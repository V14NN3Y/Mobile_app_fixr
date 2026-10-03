/**
 * Bienvenue — design/Main.dc.html.
 */
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { WelcomeIllustration } from '@/features/auth/components/illustrations/WelcomeIllustration';
import { fr } from '@/lib/i18n/fr';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const t = fr.auth.welcome;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20, flexGrow: 1 }}
    >
      <WelcomeIllustration />

      <View className="flex-1 justify-between gap-8 px-5 pt-8">
        <View className="gap-3">
          <Text variant="title1" className="font-display">
            {t.title}
          </Text>
          <Text variant="bodyLg" tone="secondary">
            {t.subtitle}
          </Text>
        </View>

        <View className="gap-3">
          <Button variant="primary" icon="chevronRight" onPress={() => router.push('/onboarding')}>
            {t.primaryCta}
          </Button>
          <Button variant="secondary" onPress={() => router.push('/login')}>
            {t.secondaryCta}
          </Button>
          <Text variant="caption" tone="tertiary" className="text-center">
            {t.legalPrefix}
            <Text variant="caption" className="font-body-bold" tone="tertiary">
              {t.legalTerms}
            </Text>
            {t.legalAnd}
            <Text variant="caption" className="font-body-bold" tone="tertiary">
              {t.legalPrivacy}
            </Text>
            {t.legalSuffix}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
