/**
 * Profil — design/Profile.dc.html.
 */
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ListGroup } from '@/components/ui/ListGroup';
import { ListRow } from '@/components/ui/ListRow';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useAddresses } from '@/features/addresses/hooks';
import { useAllArtisansForTrades } from '@/features/artisans/hooks';
import { bucketBookingsByTab } from '@/features/bookings/tabs';
import { useBookings } from '@/features/bookings/hooks';
import { useFavoritesStore } from '@/features/favorites/store';
import { usePaymentMethods } from '@/features/payments/hooks';
import { useCurrentUser } from '@/features/profile/hooks';
import { useMyReviews } from '@/features/reviews/hooks';
import { getInitials } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.profile;
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const userQuery = useCurrentUser();
  const bookingsQuery = useBookings();
  const addressesQuery = useAddresses();
  const paymentsQuery = usePaymentMethods();
  const myReviewsQuery = useMyReviews();
  const artisansQuery = useAllArtisansForTrades([]);
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);

  const isLoading =
    userQuery.isLoading ||
    bookingsQuery.isLoading ||
    addressesQuery.isLoading ||
    paymentsQuery.isLoading ||
    myReviewsQuery.isLoading ||
    artisansQuery.isLoading;
  const isError =
    userQuery.isError ||
    bookingsQuery.isError ||
    addressesQuery.isError ||
    paymentsQuery.isError ||
    myReviewsQuery.isError ||
    artisansQuery.isError;

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled) return;
    setAvatarUri(result.assets[0]?.uri ?? null);
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg px-5" style={{ paddingTop: insets.top + 16 }}>
        <Skeleton height={28} width="30%" />
        <View className="h-4" />
        <Skeleton height={160} rounded={24} />
        <View className="h-4" />
        <Skeleton height={200} rounded={20} />
      </View>
    );
  }

  if (isError || !userQuery.data || !bookingsQuery.data || !addressesQuery.data || !paymentsQuery.data || !myReviewsQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-5" style={{ paddingTop: insets.top }}>
        <Banner tone="error">{t.error.title}</Banner>
        <Button
          variant="primary"
          onPress={() => {
            void userQuery.refetch();
            void bookingsQuery.refetch();
            void addressesQuery.refetch();
            void paymentsQuery.refetch();
            void myReviewsQuery.refetch();
            void artisansQuery.refetch();
          }}
        >
          {t.error.retry}
        </Button>
      </View>
    );
  }

  const user = userQuery.data;
  const bookings = bookingsQuery.data;
  const addresses = addressesQuery.data;
  const payments = paymentsQuery.data;
  const artisans = artisansQuery.data?.items ?? [];

  const buckets = bucketBookingsByTab(bookings);
  const pendingReviews = bookings.filter((b) => b.status === 'done' && !b.reviewed).length;
  const favoriteArtisans = artisans.filter((a) => favoriteIds.includes(a.id));

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 20, gap: 22 }}
    >
      <View className="flex-row items-center justify-between">
        <Text variant="title1" className="font-display">
          {t.title}
        </Text>
        <Pressable
          onPress={() => router.push('/profile/settings')}
          accessibilityRole="button"
          accessibilityLabel={t.settingsLabel}
          className="h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface"
        >
          <Icon name="gear" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View className="gap-4 rounded-[24px] border border-border-subtle bg-surface p-[18px]">
        <View className="flex-row items-center gap-3.5">
          <View className="relative">
            {avatarUri ? (
              // Photo choisie côté appareil, jamais persistée (pas de champ avatarUrl à
              // écrire sans backend réel, décision du Lot 7) — visible pour la session en
              // cours seulement.
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 72, height: 72, borderRadius: 36 }}
                accessibilityLabel={`${user.firstName} ${user.lastName}`}
              />
            ) : (
              <Avatar initials={getInitials(user.firstName, user.lastName)} tone="primary" size={72} />
            )}
            <Pressable
              onPress={pickAvatar}
              accessibilityRole="button"
              accessibilityLabel={t.changePhotoLabel}
              className="absolute -bottom-0.5 -right-0.5 h-7 w-7 items-center justify-center rounded-full border border-border bg-surface"
            >
              <Icon name="photo" size={14} color={colors.text} />
            </Pressable>
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <Text variant="title3" className="font-display" numberOfLines={1}>
              {user.firstName} {user.lastName}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Text variant="caption" tone="secondary">
                {user.phone}
              </Text>
              {user.phoneVerified ? <Icon name="verified" size={15} color={colors.successInk} /> : null}
            </View>
            {user.email ? (
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row rounded-2xl bg-bg">
          <Pressable
            onPress={() => router.push('/bookings')}
            accessibilityRole="button"
            className="min-h-touch flex-1 items-center gap-0.5 py-3"
          >
            <Text variant="title3" className="font-display">
              {bookings.length}
            </Text>
            <Text variant="caption" tone="secondary">
              {t.statsLabels.missions}
            </Text>
          </Pressable>
          <View className="w-px bg-border-subtle" />
          <View className="flex-1 items-center gap-0.5 py-3">
            <Text variant="title3" className="font-display">
              {favoriteIds.length}
            </Text>
            <Text variant="caption" tone="secondary">
              {t.statsLabels.favorites}
            </Text>
          </View>
          <View className="w-px bg-border-subtle" />
          <View className="flex-1 items-center gap-0.5 py-3">
            <Text variant="title3" className="font-display">
              {myReviewsQuery.data.length}
            </Text>
            <Text variant="caption" tone="secondary">
              {t.statsLabels.reviews}
            </Text>
          </View>
        </View>
      </View>

      <ListGroup title={t.sections.activity}>
        <ListRow
          icon="calendar"
          label={t.rows.bookings.label}
          subtitle={
            bookings.length === 0
              ? t.rows.bookings.subtitleEmpty
              : t.rows.bookings.subtitle(buckets.ongoing.length, buckets.upcoming.length)
          }
          onPress={() => router.push('/bookings')}
        />
        <ListRow
          icon="heart"
          label={t.rows.favorites.label}
          subtitle={
            favoriteArtisans.length > 0
              ? favoriteArtisans.map((a) => a.firstName).join(', ')
              : t.rows.favorites.subtitleEmpty
          }
          onPress={() => router.push('/profile/favorites')}
        />
        <ListRow
          icon="star"
          label={t.rows.reviews.label}
          subtitle={pendingReviews > 0 ? t.rows.reviews.subtitle(pendingReviews) : t.rows.reviews.subtitleEmpty}
          trailing={pendingReviews > 0 ? <Badge mode="count" value={pendingReviews} /> : 'chevron'}
          onPress={() => router.push('/profile/reviews')}
        />
      </ListGroup>

      <ListGroup title={t.sections.account}>
        <ListRow
          icon="location"
          label={t.rows.addresses.label}
          subtitle={addresses.length > 0 ? addresses.map((a) => a.label).join(', ') : t.rows.addresses.subtitleEmpty}
          onPress={() => router.push('/profile/addresses')}
        />
        <ListRow
          icon="card"
          label={t.rows.payments.label}
          subtitle={payments.length > 0 ? payments.map((p) => p.label).join(' · ') : t.rows.payments.subtitleEmpty}
          onPress={() => router.push('/profile/payments')}
        />
        <ListRow
          icon="preferences"
          label={t.rows.settings.label}
          subtitle={t.rows.settings.subtitle}
          onPress={() => router.push('/profile/settings')}
        />
      </ListGroup>

      <View className="gap-3 rounded-[22px] bg-primary p-[18px]">
        <View className="gap-1">
          <Text variant="label" tone="inherit" className="font-display text-on-primary" style={{ fontSize: 18 }}>
            {t.help.title}
          </Text>
          <Text variant="caption" tone="inherit" className="text-on-primary" style={{ opacity: 0.85 }}>
            {t.help.body}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Button variant="secondary" size="md" className="flex-1" onPress={() => router.push('/messages/c_support')}>
            {t.help.writeToSupport}
          </Button>
          {/* Fond blanc translucide + texte blanc : aucune variante Button existante ne
              produit cette combinaison (primary = fond plein, tertiary = texte teal) — bouton
              local, un seul site d'usage, dans ce bandeau teal uniquement. */}
          <Pressable
            onPress={() => router.push('/profile/help')}
            accessibilityRole="button"
            className="h-11 flex-1 items-center justify-center rounded-xl bg-white/15"
          >
            <Text tone="inherit" className="font-body-extrabold text-on-primary">
              {t.help.helpCenter}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text variant="micro" tone="tertiary" className="text-center normal-case tracking-normal">
        {t.footer}
      </Text>
    </ScrollView>
  );
}
