/**
 * Profil artisan — design/ArtisanProfile.dc.html (normal) + design/ArtisanStates.dc.html
 * (indisponible, incomplet, déjà réservé, erreur).
 */
import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvailabilityStrip, RatingSummary } from '@/components/domain';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useArtisan, useArtisanAlternatives } from '@/features/artisans/hooks';
import { resolveArtisanProfileState } from '@/features/artisans/profileState';
import { useActiveBookingForArtisan } from '@/features/bookings/hooks';
import { useFavoritesStore } from '@/features/favorites/store';
import { formatFCFA, formatFCFAFrom, getInitials } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { Artisan, Booking } from '@/types/domain';

function FloatingHeaderButton({
  icon,
  onPress,
  accessibilityLabel,
  color,
}: {
  icon: 'chevronLeft' | 'share' | 'heart';
  onPress: () => void;
  accessibilityLabel: string;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="h-11 w-11 items-center justify-center rounded-md bg-surface"
      style={{ shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 }}
    >
      <Icon name={icon} size={20} color={color} />
    </Pressable>
  );
}

export default function ArtisanProfile() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.artisan;
  const { id } = useLocalSearchParams<{ id: string }>();

  const artisanQuery = useArtisan(id);
  const bookingQuery = useActiveBookingForArtisan(id);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(id);

  const isLoading = artisanQuery.isLoading || bookingQuery.isLoading;
  const isError = artisanQuery.isError || bookingQuery.isError;

  const state =
    artisanQuery.data !== undefined
      ? resolveArtisanProfileState(artisanQuery.data, bookingQuery.data ?? null)
      : null;

  const alternativesQuery = useArtisanAlternatives(id, state === 'unavailable');

  function share(artisan: Artisan) {
    void Share.share({ message: `${artisan.firstName} ${artisan.lastName} · FIXR` });
  }

  function toggleFav() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(id);
  }

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />

      {isLoading ? (
        <View style={{ paddingTop: insets.top + 54 }} className="flex-1 gap-4 px-5">
          <View className="flex-row items-center gap-3 opacity-60">
            <Skeleton width={72} height={72} rounded={999} />
            <View className="flex-1 gap-2">
              <Skeleton height={18} width="70%" />
              <Skeleton height={14} width="45%" />
            </View>
          </View>
          <Pressable
            onPress={() => router.back()}
            className="absolute h-11 w-11 items-center justify-center"
            style={{ top: insets.top + 8, left: 4 }}
            accessibilityRole="button"
            accessibilityLabel={fr.auth.common.back}
          >
            <Icon name="chevronLeft" size={22} color={colors.text} />
          </Pressable>
        </View>
      ) : isError || !artisanQuery.data || state === null ? (
        <View style={{ paddingTop: insets.top }} className="flex-1 px-5">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={fr.auth.common.back}
          >
            <Icon name="chevronLeft" size={22} color={colors.text} />
          </Pressable>
          <View className="flex-1 items-center justify-center gap-3 px-4">
            <View className="h-[88px] w-[88px] items-center justify-center rounded-3xl bg-danger-soft">
              <Icon name="alert" size={40} color={colors.danger} />
            </View>
            <Text variant="title2" className="font-display text-center">
              {t.error.title}
            </Text>
            <Text variant="body" tone="secondary" className="text-center">
              {t.error.description}
            </Text>
            <Text variant="caption" tone="secondary">
              {t.error.code}
            </Text>
          </View>
          <View className="gap-1 pb-4">
            <Button variant="primary" icon="search" onPress={() => artisanQuery.refetch()}>
              {t.error.retry}
            </Button>
            <Button variant="tertiary" onPress={() => router.back()}>
              {t.error.backToResults}
            </Button>
          </View>
        </View>
      ) : (
        <ArtisanProfileBody
          artisan={artisanQuery.data}
          state={state}
          booking={bookingQuery.data ?? null}
          alternatives={alternativesQuery.data ?? []}
          favorite={favorite}
          onToggleFavorite={toggleFav}
          onShare={share}
          insetsTop={insets.top}
        />
      )}
    </View>
  );
}

function ArtisanProfileBody({
  artisan,
  state,
  booking,
  alternatives,
  favorite,
  onToggleFavorite,
  onShare,
  insetsTop,
}: {
  artisan: Artisan;
  state: 'alreadyBooked' | 'unavailable' | 'incomplete' | 'normal';
  booking: Booking | null;
  alternatives: Artisan[];
  favorite: boolean;
  onToggleFavorite: () => void;
  onShare: (artisan: Artisan) => void;
  insetsTop: number;
}) {
  const { colors } = useTheme();
  const t = fr.artisan;
  const fullName = `${artisan.firstName} ${artisan.lastName}`;
  const initials = getInitials(artisan.firstName, artisan.lastName);

  if (state === 'alreadyBooked' && booking) {
    return (
      <View className="flex-1 px-5" style={{ paddingTop: insetsTop + 8 }}>
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel={fr.auth.common.back}
        >
          <Icon name="chevronLeft" size={22} color={colors.text} />
        </Pressable>
        <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center gap-3.5">
            <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-accent-soft">
              <Text tone="inherit" className="font-display font-body-extrabold text-accent-ink" style={{ fontSize: 24 }}>
                {initials}
              </Text>
            </View>
            <View className="flex-1 gap-1">
              <Text variant="title2" className="font-display" numberOfLines={1}>
                {fullName}
              </Text>
              <Text variant="body" tone="secondary" numberOfLines={1}>
                {artisan.trade} · ★ {artisan.rating.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} ({artisan.reviewCount})
              </Text>
              <Badge mode="verification" level={artisan.verification} />
            </View>
          </View>

          <View className="gap-2.5 rounded-2xl bg-success-soft p-4">
            <View className="flex-row items-center gap-2.5">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-success">
                <Icon name="check" size={18} color={colors.onPrimary} />
              </View>
              <Text variant="label" className="font-body-extrabold text-success-ink">
                {t.alreadyBooked.badge}
              </Text>
            </View>
            <Text variant="body" className="text-success-ink">
              {t.alreadyBooked.detail(artisan.firstName, booking.title, booking.id)}
            </Text>
          </View>

          <View className="gap-2.5 rounded-xl border border-border-subtle bg-surface p-3.5">
            <View className="flex-row justify-between">
              <Text variant="body" tone="secondary">
                {t.alreadyBooked.status}
              </Text>
              <View className="rounded-full bg-accent-soft px-2.5 py-1">
                <Text variant="micro" className="normal-case tracking-normal text-accent-ink">
                  {booking.etaMin !== undefined ? `En route · ${booking.etaMin} min` : booking.status}
                </Text>
              </View>
            </View>
            <ProgressBar value={62} tone="accent" />
          </View>

          <Text variant="body" tone="secondary">
            {t.alreadyBooked.note}
          </Text>
        </ScrollView>
        <View className="gap-2 pb-4">
          <Button variant="primary" onPress={() => router.push(`/bookings/${booking.id}/live`)}>
            {t.alreadyBooked.follow}
          </Button>
          <Button
            variant="secondary"
            onPress={() => router.push({ pathname: '/request/need', params: { artisanId: artisan.id } })}
          >
            {t.alreadyBooked.newRequest}
          </Button>
        </View>
      </View>
    );
  }

  if (state === 'unavailable') {
    const until = artisan.availability.unavailableUntil
      ? new Date(artisan.availability.unavailableUntil).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      : '';
    return (
      <View className="flex-1 px-5" style={{ paddingTop: insetsTop + 8 }}>
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel={fr.auth.common.back}
        >
          <Icon name="chevronLeft" size={22} color={colors.text} />
        </Pressable>
        <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center gap-3.5">
            <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-accent-soft opacity-60">
              <Text tone="inherit" className="font-display font-body-extrabold text-accent-ink" style={{ fontSize: 24 }}>
                {initials}
              </Text>
            </View>
            <View className="flex-1 gap-1">
              <Text variant="title2" className="font-display" numberOfLines={1}>
                {fullName}
              </Text>
              <Text variant="body" tone="secondary" numberOfLines={1}>
                {artisan.trade} · ★ {artisan.rating.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} ({artisan.reviewCount})
              </Text>
              <View className="self-start rounded-full bg-border-subtle px-2.5 py-1">
                <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
                  {t.unavailable.badge}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3 rounded-2xl bg-warning-soft p-3.5">
            <Icon name="clock" size={22} color={colors.warningInk} />
            <View className="flex-1 gap-1">
              <Text variant="label" className="font-body-extrabold text-warning-ink">
                {t.unavailable.returnOn(until)}
              </Text>
              <Text variant="body" className="text-warning-ink">
                {t.unavailable.notice(artisan.firstName)}
              </Text>
              <Text variant="label" className="font-body-extrabold text-warning-ink underline">
                {t.unavailable.notifyMe}
              </Text>
            </View>
          </View>

          {alternatives.length > 0 ? (
            <View className="gap-2.5">
              <Text variant="title3" className="font-display">
                {t.unavailable.alternativesTitle}
              </Text>
              <View className="gap-1 rounded-xl border border-border-subtle bg-surface px-3.5">
                {alternatives.map((alt, i) => (
                  <Pressable
                    key={alt.id}
                    onPress={() => router.push(`/artisan/${alt.id}`)}
                    accessibilityRole="button"
                    className={`min-h-[60px] flex-row items-center gap-3 py-2 ${i < alternatives.length - 1 ? 'border-b border-border-subtle' : ''}`}
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-soft">
                      <Text tone="inherit" className="font-body-extrabold text-primary">
                        {getInitials(alt.firstName, alt.lastName)}
                      </Text>
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text variant="label" className="font-body-bold" numberOfLines={1}>
                        {alt.firstName} {alt.lastName}
                      </Text>
                      <Text variant="caption" tone="secondary" numberOfLines={1}>
                        ★ {alt.rating.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} ·{' '}
                        {alt.distanceKm} km · {alt.availability.label}
                      </Text>
                    </View>
                    <Text variant="label" className="font-body-extrabold text-primary">
                      {t.unavailable.see}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
        <View className="gap-2 pb-4">
          <Button variant="primary" onPress={() => router.back()}>
            {t.unavailable.seeAvailable}
          </Button>
          <View className="h-11 items-center justify-center rounded-md bg-disabled-bg">
            <Text variant="caption" tone="disabled" className="font-body-bold">
              {t.unavailable.requestDisabled(artisan.firstName)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // 'incomplete' et 'normal' partagent la même mise en page riche (photo de couverture,
  // stats, disponibilité…) ; seules les sections À propos/Compétences/Réalisations/Avis
  // varient selon la richesse réelle des données.
  return (
    <View className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View className="h-[200px] bg-primary" />
        <View
          className="absolute left-4 right-4 flex-row justify-between"
          style={{ top: insetsTop + 8 }}
        >
          <FloatingHeaderButton
            icon="chevronLeft"
            onPress={() => router.back()}
            accessibilityLabel={fr.auth.common.back}
            color={colors.text}
          />
          <View className="flex-row gap-2">
            <FloatingHeaderButton
              icon="share"
              onPress={() => onShare(artisan)}
              accessibilityLabel={t.share}
              color={colors.text}
            />
            <FloatingHeaderButton
              icon="heart"
              onPress={onToggleFavorite}
              accessibilityLabel={favorite ? t.removeFavorite : t.addFavorite}
              color={favorite ? colors.accent : colors.text}
            />
          </View>
        </View>

        <View className="gap-4 px-5" style={{ marginTop: -44 }}>
          <View className="flex-row items-end justify-between">
            <View className="h-[104px] w-[104px] items-center justify-center rounded-full border-4 border-bg bg-accent-soft">
              <Text tone="inherit" className="font-display font-body-extrabold text-accent-ink" style={{ fontSize: 32 }}>
                {initials}
              </Text>
            </View>
            {artisan.online ? (
              <View className="mb-2 flex-row items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1">
                <View className="h-2 w-2 rounded-full bg-online" />
                <Text variant="micro" className="normal-case tracking-normal text-success-ink">
                  {t.online}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="gap-1.5">
            <View className="flex-row items-center gap-2">
              <Text variant="title1" className="font-display" numberOfLines={1}>
                {fullName}
              </Text>
              <Icon name="verified" size={20} color={colors.primary} />
            </View>
            <Text variant="bodyLg" tone="secondary">
              {artisan.trade} · {artisan.neighborhood}, {artisan.city}
            </Text>
            <View className="flex-row flex-wrap gap-1.5 pt-0.5">
              <Badge mode="verification" level={artisan.verification} />
              {artisan.yearsExperience === 0 ? (
                <View className="rounded-full bg-accent-soft px-2.5 py-1">
                  <Text variant="micro" className="normal-case tracking-normal text-accent-ink">
                    {t.incomplete.new}
                  </Text>
                </View>
              ) : null}
              {artisan.responseTimeMin !== undefined ? (
                <View className="rounded-full bg-surface-muted px-2.5 py-1">
                  <Text variant="micro" className="normal-case tracking-normal">
                    {t.respondsIn(artisan.responseTimeMin)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View className="flex-row rounded-xl border border-border-subtle bg-surface py-3">
            <View className="flex-1 items-center gap-0.5">
              <View className="flex-row items-center gap-1">
                <Text variant="title2" className="font-display">
                  {artisan.rating.toLocaleString('fr-FR', { minimumFractionDigits: 1 })}
                </Text>
                <Icon name="star" size={16} color={colors.rating} filled />
              </View>
              <Text variant="caption" tone="secondary" className="font-body-bold">
                {artisan.reviewCount} {t.stats.reviews}
              </Text>
            </View>
            <View className="flex-1 items-center gap-0.5 border-x border-border-subtle">
              <Text variant="title2" className="font-display">
                {artisan.interventions}
              </Text>
              <Text variant="caption" tone="secondary" className="font-body-bold">
                {t.stats.interventions}
              </Text>
            </View>
            <View className="flex-1 items-center gap-0.5">
              <Text variant="title2" className="font-display">
                {artisan.yearsExperience} ans
              </Text>
              <Text variant="caption" tone="secondary" className="font-body-bold">
                {t.stats.experience}
              </Text>
            </View>
          </View>

          <View className="gap-3 rounded-xl border border-border-subtle bg-surface p-4">
            <View className="flex-row items-center justify-between">
              <Text variant="title3" className="font-display">
                {t.availabilitySection}
              </Text>
              {artisan.availability.today ? (
                <View className="rounded-full bg-success-soft px-2.5 py-1">
                  <Text variant="micro" className="normal-case tracking-normal text-success-ink">
                    {fr.filters.availability.today}
                  </Text>
                </View>
              ) : null}
            </View>
            <AvailabilityStrip days={buildAvailabilityDays(artisan)} nextSlotLabel={artisan.availability.nextSlot ? formatSlot(artisan.availability.nextSlot) : undefined} />
          </View>

          <View className="gap-2">
            <Text variant="title3" className="font-display">
              {t.about}
            </Text>
            {artisan.bio ? (
              <Text variant="bodyLg" tone="secondary">
                {artisan.bio}
              </Text>
            ) : (
              <Text variant="body" tone="secondary" className="italic">
                {t.noBio}
              </Text>
            )}
          </View>

          <View className="gap-2.5">
            <Text variant="title3" className="font-display">
              {t.skills}
            </Text>
            {artisan.skills.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {artisan.skills.map((skill) => (
                  <View key={skill} className="h-[34px] items-center justify-center rounded-md bg-surface-muted px-3">
                    <Text variant="caption" className="font-body-bold">
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {artisan.zones.length > 0 ? (
            <View className="gap-2.5">
              <Text variant="title3" className="font-display">
                {t.zones}
              </Text>
              <View className="flex-row gap-3 rounded-xl border border-border-subtle bg-surface p-3.5">
                <Icon name="location" size={20} color={colors.accent} />
                <Text variant="body" tone="secondary" className="flex-1">
                  {artisan.zones.map((z) => `${z.city} — ${z.neighborhoods.join(', ')}`).join('\n')}
                </Text>
              </View>
            </View>
          ) : null}

          <View className="gap-2.5">
            <Text variant="title3" className="font-display">
              {t.gallery}
            </Text>
            {artisan.gallery.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {artisan.gallery.map((g) => (
                  <View key={g.id} className="w-[150px] gap-1.5">
                    <View className="h-[150px] items-center justify-center rounded-2xl bg-primary-soft">
                      <Icon name="photo" size={40} color={colors.primary} />
                    </View>
                    <Text variant="caption" className="font-body-bold" numberOfLines={1}>
                      {g.caption}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <>
                <View className="flex-row gap-2">
                  {[0, 1, 2].map((i) => (
                    <View key={i} className="h-[84px] flex-1 rounded-md border-[1.5px] border-dashed border-border-strong" />
                  ))}
                </View>
                <Text variant="caption" tone="secondary">
                  {t.noGallery}
                </Text>
              </>
            )}
          </View>

          {artisan.prices.length > 0 ? (
            <View className="gap-2.5">
              <Text variant="title3" className="font-display">
                {t.prices}
              </Text>
              <View className="rounded-xl border border-border-subtle bg-surface px-4">
                {artisan.prices.map((p, i) => (
                  <View
                    key={p.label}
                    className={`min-h-[44px] flex-row items-center justify-between py-2 ${i < artisan.prices.length - 1 ? 'border-b border-border-subtle' : ''}`}
                  >
                    <Text variant="body">{p.label}</Text>
                    <Text variant="body" className="font-body-bold">
                      {p.exact ? formatFCFA(p.from) : formatFCFAFrom(p.from).replace('Dès', 'dès')}
                    </Text>
                  </View>
                ))}
              </View>
              <Text variant="caption" tone="secondary">
                {t.pricesFootnote}
              </Text>
            </View>
          ) : null}

          <View className="gap-3">
            <Text variant="title3" className="font-display">
              {t.reviews}
            </Text>
            {artisan.ratingDistribution ? (
              <View className="rounded-xl border border-border-subtle bg-surface p-4">
                <RatingSummary
                  average={artisan.rating}
                  reviewCount={artisan.reviewCount}
                  distribution={artisan.ratingDistribution}
                />
              </View>
            ) : (
              <View className="items-center gap-1 rounded-xl border border-border-subtle bg-surface p-5">
                <Text style={{ fontSize: 26, letterSpacing: 2 }} tone="disabled">
                  ★★★★★
                </Text>
                <Text variant="label" className="font-body-bold">
                  {t.noReviews.title}
                </Text>
                <Text variant="caption" tone="secondary">
                  {t.noReviews.subtitle}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute left-0 right-0 bottom-0 flex-row items-center gap-2.5 border-t border-border-subtle bg-surface px-5 pt-3"
        style={{ paddingBottom: 24 }}
      >
        <Pressable
          onPress={() => router.push(`/messages`)}
          accessibilityRole="button"
          accessibilityLabel={t.contact(artisan.firstName)}
          className="h-[52px] w-[52px] items-center justify-center rounded-lg border-[1.5px] border-border-strong"
        >
          <Icon name="message" size={22} color={colors.text} />
        </Pressable>
        <Button
          variant="primary"
          className="flex-1"
          onPress={() => router.push({ pathname: '/request/need', params: { artisanId: artisan.id } })}
        >
          {state === 'incomplete' ? t.requestQuote : t.requestIntervention}
        </Button>
      </View>
    </View>
  );
}

function buildAvailabilityDays(artisan: Artisan) {
  const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const now = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const isToday = i === 0;
    return {
      date: d.toISOString(),
      shortLabel: labels[d.getDay() === 0 ? 6 : d.getDay() - 1]!,
      dayNumber: String(d.getDate()),
      status: (isToday ? (artisan.availability.today ? 'today' : 'full') : 'available') as
        | 'today'
        | 'available'
        | 'full',
    };
  });
}

function formatSlot(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}
