/**
 * Illustration slide 2 — design/Onboarding2.dc.html : trajet en tirets animé + carte
 * « L'artisan est en route » avec barre de progression 5 segments.
 */
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

import { DashedRoute, FadeUp, PulsingDot } from './motion-primitives';

export function OnboardingIllustration2() {
  const { colors } = useTheme();
  const t = fr.auth.onboarding.slide2;
  // 3 étapes faites, 1 en cours, 1 à venir — cohérent avec la légende à 4 libellés + le
  // titre « L'artisan est en route » (étape « En route » en cours).
  const segmentStates: ('done' | 'current' | 'upcoming')[] = [
    'done',
    'done',
    'current',
    'upcoming',
  ];

  return (
    <View className="h-[400px] items-center justify-center overflow-hidden rounded-[28px] bg-accent-soft">
      <Svg
        width="100%"
        height="70%"
        viewBox="0 0 358 280"
        style={{ position: 'absolute', bottom: 0 }}
      >
        <DashedRoute
          d="M60 220 C 110 160, 200 175, 240 120 S 300 70, 330 76"
          color={colors.accent}
        />
        <Circle cx={330} cy={56} r={22} fill={colors.primary} />
        <Path
          d="M321 60v-9l9-7 9 7v9h-6v-6h-6v6z"
          stroke={colors.onPrimary}
          strokeWidth={2}
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>

      <View style={{ position: 'absolute', left: 56, bottom: 90 }}>
        <PulsingDot size={16} color={colors.accent} ringColor={colors.accent} />
      </View>

      <FadeUp delayMs={100} style={{ position: 'absolute', left: 20, right: 20, top: 22 }}>
        <View className="gap-2.5 rounded-2xl bg-surface p-4" style={{ elevation: 6 }}>
          <View className="flex-row items-center justify-between">
            <Text variant="label">{t.cardTitle}</Text>
            <Text variant="caption" className="font-body-bold text-accent-ink">
              {t.cardEta}
            </Text>
          </View>
          <View className="flex-row gap-1">
            {segmentStates.map((s, i) => (
              <View
                key={i}
                className={cn(
                  'h-[5px] flex-1 rounded-[3px]',
                  s === 'done' ? 'bg-primary' : s === 'current' ? 'bg-accent' : 'bg-border-subtle',
                )}
              />
            ))}
          </View>
          <View className="flex-row items-center justify-between">
            {t.steps.map((label) => (
              <Text
                key={label}
                variant="micro"
                tone="tertiary"
                className="normal-case tracking-normal"
              >
                {label}
              </Text>
            ))}
          </View>
        </View>
      </FadeUp>
    </View>
  );
}
