/**
 * Illustration slide 3 — design/Onboarding3.dc.html : carte « Devis détaillé » (réutilise
 * formatFCFA, src/lib/format.ts) + badge sécurité (icône « verified » existante — pas de
 * nouvelle icône « bouclier », déjà un bouclier+coche).
 */
import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';
import { formatFCFA } from '@/lib/format';
import { useTheme } from '@/theme/useTheme';

import { PopIn } from './motion-primitives';

const LABOR = 12000;
const TRAVEL = 2000;
const MATERIALS = 8500;

function Row({ label, amount }: { label: string; amount: number }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text variant="caption" tone="secondary" className="font-body-bold">
        {label}
      </Text>
      <Text variant="caption" tone="secondary" className="font-body-bold">
        {formatFCFA(amount)}
      </Text>
    </View>
  );
}

export function OnboardingIllustration3() {
  const { colors } = useTheme();
  const t = fr.auth.onboarding.slide3;

  return (
    <View className="h-[400px] items-center justify-center rounded-[28px] bg-success-soft">
      <View className="w-[272px] gap-3 rounded-2xl bg-surface p-4" style={{ elevation: 8 }}>
        <View className="flex-row items-center justify-between">
          <Text variant="label">{t.quoteTitle}</Text>
          <View className="rounded-full bg-success-soft px-2.5 py-1">
            <Text variant="micro" className="normal-case tracking-normal text-success-ink">
              {t.quoteValidated}
            </Text>
          </View>
        </View>
        <Row label={t.labor} amount={LABOR} />
        <Row label={t.travel} amount={TRAVEL} />
        <Row label={t.materials} amount={MATERIALS} />
        <View className="h-px bg-border-subtle" />
        <View className="flex-row items-center justify-between">
          <Text variant="body" className="font-body-extrabold">
            {t.total}
          </Text>
          <Text variant="body" className="font-body-extrabold">
            {formatFCFA(LABOR + TRAVEL + MATERIALS)}
          </Text>
        </View>
      </View>

      <PopIn delayMs={300} style={{ position: 'absolute', right: 40, bottom: 60 }}>
        <View
          className="h-[76px] w-[76px] items-center justify-center rounded-[24px] bg-success"
          style={{ elevation: 10 }}
        >
          <Icon name="verified" size={32} color={colors.onPrimary} />
        </View>
      </PopIn>
    </View>
  );
}
