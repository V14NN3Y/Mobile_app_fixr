/**
 * Résumé des notes — design/ArtisanProfile.dc.html « Avis clients » (score 40px +
 * distribution 5 barres). Réutilise RatingDisplay (étoiles) et ProgressBar (tone="rating").
 */
import { View } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';

export type RatingSummaryProps = {
  average: number;
  reviewCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  testID?: string;
};

export function RatingSummary({ average, reviewCount, distribution, testID }: RatingSummaryProps) {
  return (
    <View testID={testID} className="flex-row items-center gap-4">
      <View className="w-24 items-center gap-0.5">
        <Text variant="display" style={{ fontSize: 40, lineHeight: 44 }}>
          {average.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </Text>
        <Text variant="caption" tone="secondary" className="font-body-bold">
          {reviewCount} {fr.artisan.stats.reviews}
        </Text>
      </View>
      <View className="flex-1 gap-1.5">
        {([5, 4, 3, 2, 1] as const).map((n) => (
          <View key={n} className="flex-row items-center gap-2">
            <Text variant="caption" tone="secondary" className="w-2 font-body-bold">
              {n}
            </Text>
            <View className="flex-1">
              <ProgressBar value={distribution[n]} height={6} tone="rating" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
