/**
 * Illustration slide 1 — design/Onboarding1.dc.html : barre de recherche factice + 3 cartes
 * artisan empilées (Koffi mis en avant, badge « Top choix »).
 */
import { View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

import { FadeUp } from './motion-primitives';

export function OnboardingIllustration1() {
  const { colors } = useTheme();
  const t = fr.auth.onboarding.slide1;

  return (
    <View className="h-[400px] justify-center gap-3 rounded-[28px] bg-primary-soft p-6">
      <View className="flex-row items-center gap-2 rounded-xl bg-surface px-3.5 py-3">
        <Icon name="search" size={18} color={colors.primary} />
        <Text variant="label">{t.searchPlaceholder}</Text>
        <Text variant="caption" tone="tertiary">
          {t.searchZone}
        </Text>
      </View>

      {t.artisans.map((a, i) => (
        <FadeUp key={a.name} delayMs={i * 100}>
          <View
            className="flex-row items-center gap-3 rounded-2xl bg-surface p-3"
            style={
              i === 0
                ? { borderWidth: 2, borderColor: colors.primary, opacity: 1 }
                : { opacity: 1 - i * 0.15 }
            }
          >
            <Avatar
              initials={a.name
                .split(' ')
                .map((w) => w[0])
                .join('')}
              size={40}
            />
            <View className="flex-1 gap-0.5">
              <Text variant="label">{a.name}</Text>
              <View className="flex-row items-center gap-1">
                <Icon name="star" size={11} color={colors.rating} />
                <Text variant="caption" tone="secondary">
                  {a.rating} · {a.meta}
                </Text>
              </View>
            </View>
            {i === 0 ? (
              <View className="rounded-full bg-primary-soft px-2.5 py-1">
                <Text variant="micro" className="normal-case tracking-normal text-primary">
                  {t.topChoice}
                </Text>
              </View>
            ) : null}
          </View>
        </FadeUp>
      ))}
    </View>
  );
}
