/**
 * Onboarding (3 slides) — design/Onboarding1/2/3.dc.html. Le corps swipeable
 * (OnboardingPager) est isolé dans src/features/auth/components/ — voir son commentaire
 * pour pourquoi react-native-pager-view ne peut pas être importé directement ici.
 */
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { PageDots } from '@/components/ui/PageDots';
import { Text } from '@/components/ui/Text';
import { BackButton } from '@/features/auth/components/BackButton';
import { OnboardingIllustration1 } from '@/features/auth/components/illustrations/OnboardingIllustration1';
import { OnboardingIllustration2 } from '@/features/auth/components/illustrations/OnboardingIllustration2';
import { OnboardingIllustration3 } from '@/features/auth/components/illustrations/OnboardingIllustration3';
import {
  OnboardingPager,
  type OnboardingPagerRef,
} from '@/features/auth/components/OnboardingPager';
import { fr } from '@/lib/i18n/fr';

const SLIDES = [
  { Illustration: OnboardingIllustration1, copy: fr.auth.onboarding.slide1 },
  { Illustration: OnboardingIllustration2, copy: fr.auth.onboarding.slide2 },
  { Illustration: OnboardingIllustration3, copy: fr.auth.onboarding.slide3 },
] as const;

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<OnboardingPagerRef>(null);
  const [page, setPage] = useState(0);
  const t = fr.auth.onboarding;
  const isLast = page === SLIDES.length - 1;

  return (
    <View
      className="flex-1 bg-bg"
      style={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 20 }}
    >
      <View className="h-[52px] flex-row items-center px-3">
        {page > 0 ? (
          <BackButton onPress={() => pagerRef.current?.goTo(page - 1)} />
        ) : (
          <View className="w-11" />
        )}
        <View className="flex-1 items-center">
          <PageDots count={SLIDES.length} activeIndex={page} testID="onboarding-dots" />
        </View>
        {!isLast ? (
          <Button
            variant="tertiary"
            size="sm"
            onPress={() => router.push('/login')}
            accessibilityLabel={t.skip}
          >
            {t.skip}
          </Button>
        ) : (
          <View className="w-11" />
        )}
      </View>

      <OnboardingPager ref={pagerRef} page={page} onPageChange={setPage}>
        {SLIDES.map(({ Illustration, copy }, i) => (
          <View key={i} className="gap-8">
            <View className="mx-4 mt-2">
              <Illustration />
            </View>
            <View className="gap-3 px-6">
              <Text variant="title1" className="font-display">
                {copy.title}
              </Text>
              <Text variant="bodyLg" tone="secondary">
                {copy.description}
              </Text>
            </View>
          </View>
        ))}
      </OnboardingPager>

      <View className="gap-1 px-6">
        {isLast ? (
          <>
            <Button variant="primary" onPress={() => router.push('/signup')}>
              {t.createAccount}
            </Button>
            <Button variant="tertiary" onPress={() => router.push('/login')}>
              {t.haveAccount}
            </Button>
          </>
        ) : (
          <Button variant="primary" onPress={() => pagerRef.current?.goTo(page + 1)}>
            {t.next}
          </Button>
        )}
      </View>
    </View>
  );
}
