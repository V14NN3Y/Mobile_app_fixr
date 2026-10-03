/**
 * Illustration de l'écran Bienvenue — design/Main.dc.html (héro 390×436). Composition :
 * formes décoratives simples en react-native-svg (grille, trajet pointillé, pin) + vrais
 * composants (Avatar, Badge, Card) pour la carte artisan flottante et le badge « En route ».
 * Couleurs : tokens existants ou surfaceMuted (le sable #EFE8DC de la maquette n'a pas
 * d'équivalent exact — approximé, pas de nouveau token pour un usage unique).
 */
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

import { DashedRoute, FadeUp, FloatingCard, PulsingDot } from './motion-primitives';

export function WelcomeIllustration() {
  const { colors } = useTheme();
  const t = fr.auth.welcome.illustration;

  return (
    <View className="h-[300px] overflow-hidden rounded-b-[32px] bg-surface-muted">
      <Svg width="100%" height="100%" viewBox="0 0 390 300" style={{ position: 'absolute' }}>
        <Path
          d="M-20 90 L410 65 M-20 220 L410 195"
          stroke={colors.surface}
          strokeWidth={14}
          strokeLinecap="round"
        />
        <DashedRoute
          d="M60 220 C 100 170, 180 180, 210 140 S 270 110, 300 116"
          color={colors.accent}
        />
        <Circle cx={300} cy={96} r={15} fill={colors.primary} />
        <Circle cx={300} cy={96} r={5.5} fill={colors.surface} />
      </Svg>

      <FadeUp delayMs={100} style={{ position: 'absolute', left: 20, top: 100, width: 220 }}>
        <FloatingCard>
          <View className="flex-row gap-2.5 rounded-xl bg-surface p-3.5" style={{ elevation: 6 }}>
            <Avatar initials="KA" size={46} />
            <View className="flex-1 gap-0.5">
              <View className="flex-row items-center gap-1">
                <Text variant="label">{t.artisanName}</Text>
                <Icon name="verified" size={14} color={colors.primary} />
              </View>
              <Text variant="caption" tone="secondary">
                {t.artisanTrade}
              </Text>
              <View className="flex-row items-center gap-1">
                <Icon name="star" size={12} color={colors.rating} />
                <Text variant="caption" className="font-body-bold">
                  {t.rating}
                </Text>
                <Text variant="caption" tone="tertiary">
                  {t.reviews}
                </Text>
              </View>
            </View>
          </View>
        </FloatingCard>
      </FadeUp>

      <FadeUp delayMs={250} style={{ position: 'absolute', right: 22, top: 190 }}>
        <View
          className="flex-row items-center gap-2 rounded-full bg-surface py-2.5 pl-3 pr-4"
          style={{ elevation: 6 }}
        >
          <PulsingDot size={10} color={colors.online} ringColor={colors.online} />
          <Text variant="caption" className="font-body-extrabold">
            {t.onTheWay}
          </Text>
        </View>
      </FadeUp>
    </View>
  );
}
