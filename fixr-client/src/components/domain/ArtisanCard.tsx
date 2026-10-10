/**
 * Carte artisan — 4 rendus partageant les mêmes données (design/Home.dc.html « Recommandés »
 * et « Disponibles maintenant », design/Results.dc.html liste, design/ResultsMap.dc.html
 * carte flottante). Même forme de données partout : éviter 4 composants qui divergeraient.
 */
import { Pressable, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { fr } from '@/lib/i18n/fr';
import { formatDistanceKm, formatFCFAFrom, getInitials } from '@/lib/format';
import { useTheme } from '@/theme/useTheme';
import type { Artisan } from '@/types/domain';

export type ArtisanCardVariant = 'compact' | 'row' | 'rich' | 'floating';

export type ArtisanCardProps = {
  artisan: Artisan;
  variant: ArtisanCardVariant;
  onPress: () => void;
  onRequestPress?: () => void;
  testID?: string;
};

export function ArtisanCard({ artisan, variant, onPress, onRequestPress, testID }: ArtisanCardProps) {
  const { colors } = useTheme();
  const initials = getInitials(artisan.firstName, artisan.lastName);
  const fullName =
    variant === 'compact' ? `${artisan.firstName} ${artisan.lastName.charAt(0)}.` : artisan.firstName + ' ' + artisan.lastName;

  if (variant === 'compact') {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        className="w-[168px] gap-2.5 rounded-xl border border-border-subtle bg-surface p-3.5 active:bg-surface-muted"
      >
        <View className="flex-row items-start justify-between">
          <Avatar initials={initials} seed={artisan.id} size={56} />
          <View className="flex-row items-center gap-0.5">
            <Icon name="star" size={14} color={colors.rating} filled />
            <Text variant="label" className="font-body-extrabold">
              {artisan.rating.toLocaleString('fr-FR', { minimumFractionDigits: 1 })}
            </Text>
          </View>
        </View>
        <View className="gap-0.5">
          <View className="flex-row items-center gap-1">
            <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
              {fullName}
            </Text>
            <Icon name="verified" size={14} color={colors.primary} />
          </View>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {artisan.trade} · {formatDistanceKm(artisan.distanceKm)}
          </Text>
        </View>
        <Text variant="caption" className="font-body-extrabold text-primary">
          {formatFCFAFrom(artisan.priceFrom)}
        </Text>
      </Pressable>
    );
  }

  if (variant === 'row') {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        className="flex-row items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3 active:bg-surface-muted"
      >
        <View className="relative">
          <Avatar initials={initials} seed={artisan.id} size={48} />
          {artisan.online ? (
            <View className="absolute bottom-0 right-0 h-[13px] w-[13px] rounded-full border-2 border-surface bg-online" />
          ) : null}
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
            {fullName}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {artisan.trade} · ★ {artisan.rating.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} ·{' '}
            {formatDistanceKm(artisan.distanceKm)}
          </Text>
        </View>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: artisan.availability.today ? colors.successSoft : colors.warningSoft }}
        >
          <Text
            variant="micro"
            tone="inherit"
            className="normal-case tracking-normal"
            style={{ color: artisan.availability.today ? colors.successInk : colors.warningInk }}
            numberOfLines={1}
          >
            {artisan.availability.label}
          </Text>
        </View>
      </Pressable>
    );
  }

  const avatarSize = variant === 'rich' ? 60 : 56;

  return (
    <View
      testID={testID}
      className="gap-3 rounded-xl border border-border-subtle bg-surface p-3.5"
    >
      <Pressable onPress={onPress} accessibilityRole="button" className="flex-row gap-3">
        <View className="relative">
          <Avatar initials={initials} seed={artisan.id} size={avatarSize} />
          {artisan.online ? (
            <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface bg-online" />
          ) : null}
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <View className="flex-row items-start justify-between gap-2">
            <Text variant="bodyLg" className="font-body-extrabold flex-1" numberOfLines={1}>
              {fullName}
            </Text>
            <View className="flex-row items-center gap-0.5">
              <Icon name="star" size={15} color={colors.rating} filled />
              <Text variant="label" className="font-body-extrabold">
                {artisan.rating.toLocaleString('fr-FR', { minimumFractionDigits: 1 })}
              </Text>
              {variant === 'rich' ? (
                <Text variant="caption" tone="secondary">
                  ({artisan.reviewCount})
                </Text>
              ) : null}
            </View>
          </View>
          {variant === 'rich' ? (
            <>
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                {artisan.trade} · {artisan.yearsExperience} ans
              </Text>
              <View className="flex-row items-center gap-1">
                <Icon name="location" size={14} color={colors.textTertiary} />
                <Text variant="caption" tone="secondary" numberOfLines={1}>
                  {artisan.neighborhood} · {formatDistanceKm(artisan.distanceKm)}
                </Text>
              </View>
            </>
          ) : (
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              ({artisan.reviewCount}) · {formatDistanceKm(artisan.distanceKm)}
            </Text>
          )}
        </View>
      </Pressable>

      {variant === 'rich' ? (
        <View className="flex-row flex-wrap gap-1.5">
          <View
            className="rounded-full px-2.5 py-1"
            style={{
              backgroundColor: artisan.availability.today ? colors.successSoft : colors.warningSoft,
            }}
          >
            <Text
              variant="micro"
              tone="inherit"
              className="normal-case tracking-normal"
              style={{ color: artisan.availability.today ? colors.successInk : colors.warningInk }}
              numberOfLines={1}
            >
              {artisan.availability.label}
            </Text>
          </View>
          <Badge mode="verification" level={artisan.verification} />
          <View className="rounded-full bg-surface-muted px-2.5 py-1">
            <Text variant="micro" className="normal-case tracking-normal" numberOfLines={1}>
              {formatFCFAFrom(artisan.priceFrom)}
            </Text>
          </View>
        </View>
      ) : (
        <Text variant="body" numberOfLines={1}>
          <Text className="font-body-extrabold text-success">{artisan.availability.label}</Text>
          {' · '}
          <Text className="font-body-extrabold">{formatFCFAFrom(artisan.priceFrom)}</Text>
        </Text>
      )}

      <View className="flex-row gap-2">
        <Button variant="secondary" size="md" className="flex-1" onPress={onPress}>
          {fr.results.viewProfile}
        </Button>
        <Button variant="primary" size="md" className="flex-1" onPress={onRequestPress ?? onPress}>
          {fr.results.request}
        </Button>
      </View>
    </View>
  );
}
