/**
 * Rapport d'intervention — design/Report.dc.html.
 */
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useArtisan } from '@/features/artisans/hooks';
import { useBooking, useReportForBooking, useValidateReport } from '@/features/bookings/hooks';
import { formatFCFA, formatWeekdayDateTime } from '@/lib/format';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

export default function Report() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.bookings.report;
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photoPhase, setPhotoPhase] = useState<'before' | 'after'>('before');

  const bookingQuery = useBooking(id);
  const reportQuery = useReportForBooking(id);
  const artisanQuery = useArtisan(bookingQuery.data?.artisanId ?? '', Boolean(bookingQuery.data?.artisanId));
  const validateReportMutation = useValidateReport();

  const isLoading = bookingQuery.isLoading || reportQuery.isLoading;

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg px-5" style={{ paddingTop: insets.top + 16 }}>
        <Stack.Screen options={{ headerShown: true, title: t.title }} />
        <Skeleton height={200} rounded={20} />
      </View>
    );
  }

  if (reportQuery.isError || !reportQuery.data || !bookingQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-5" style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: true, title: t.title }} />
        <Banner tone="error">{t.notFound}</Banner>
        <Button variant="secondary" onPress={() => router.push(`/bookings/${id}`)}>
          {t.backToDetail}
        </Button>
      </View>
    );
  }

  const booking = bookingQuery.data;
  const report = reportQuery.data;
  const artisan = artisanQuery.data;

  const materialsTotal = report.materials.reduce((sum, m) => sum + m.qty * m.unitPrice, 0);
  const total = report.labor + report.travel + materialsTotal;
  const inRange =
    booking.priceEstimate && total >= booking.priceEstimate.min && total <= booking.priceEstimate.max;

  const photos = report.photos.filter((p) => p.phase === photoPhase);

  async function downloadPdf() {
    const html = buildReportHtml();
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
  }

  function buildReportHtml(): string {
    const materialsRows = report.materials
      .map(
        (m) =>
          `<tr><td>${m.label}</td><td>${m.qty}</td><td>${formatFCFA(m.unitPrice)}</td><td>${formatFCFA(m.qty * m.unitPrice)}</td></tr>`,
      )
      .join('');
    return `<html><body style="font-family:-apple-system,sans-serif;padding:24px;color:#12161F">
      <h1>${booking.title} — ${booking.id}</h1>
      <p>${formatWeekdayDateTime(booking.slotStart)} ${artisan ? `· ${artisan.firstName} ${artisan.lastName}` : ''}</p>
      <h2>${t.tasksTitle}</h2>
      <p>${report.summary}</p>
      <ul>${report.tasks.map((task) => `<li>${task}</li>`).join('')}</ul>
      <h2>${t.materialsTitle}</h2>
      <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%">
        <tr><th>${t.materialsHeaders.item}</th><th>${t.materialsHeaders.qty}</th><th>${t.materialsHeaders.price}</th><th></th></tr>
        ${materialsRows}
      </table>
      <h2>${t.totalTitle}</h2>
      <p>${t.labor} : ${formatFCFA(report.labor)}<br/>${t.travel} : ${formatFCFA(report.travel)}<br/>${t.materials} : ${formatFCFA(materialsTotal)}<br/><b>${t.total} : ${formatFCFA(total)}</b></p>
      <p>${t.warranty(report.warrantyDays)}</p>
    </body></html>`;
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t.title,
          headerRight: () => (
            <Pressable
              onPress={() => void Share.share({ message: `${booking.title} — ${booking.id}` })}
              accessibilityRole="button"
              accessibilityLabel={t.shareLabel}
              hitSlop={8}
            >
              <Icon name="share" size={20} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      {report.status === 'awaiting_validation' ? (
        <View className="mx-5 mt-4 flex-row gap-3 rounded-2xl bg-warning-soft p-3.5">
          <Icon name="clock" size={20} color={colors.warningInk} />
          <View className="flex-1 gap-0.5">
            <Text variant="label" className="font-body-extrabold text-warning-ink">
              {t.pendingBanner}
            </Text>
            <Text variant="caption" className="text-warning-ink">
              {t.pendingBannerSub}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="gap-1 px-5 pt-4">
        <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
          {booking.id}
        </Text>
        <Text variant="title1" className="font-display">
          {booking.title}
        </Text>
        <Text variant="body" tone="secondary">
          {formatWeekdayDateTime(report.startedAt)}
          {artisan ? ` · ${artisan.firstName} ${artisan.lastName}` : ''}
        </Text>
      </View>

      <View className="gap-2.5 px-5 pt-5">
        <Text variant="title3" className="font-display">
          {t.tasksTitle}
        </Text>
        <View className="gap-2.5 rounded-xl border border-border-subtle bg-surface p-4">
          <Text variant="body" tone="secondary">
            {report.summary}
          </Text>
          {report.tasks.map((task) => (
            <View key={task} className="flex-row items-start gap-2">
              <Icon name="check" size={16} color={colors.successInk} />
              <Text variant="body" tone="secondary" className="flex-1">
                {task}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {report.photos.length > 0 ? (
        <View className="gap-3 px-5 pt-5">
          <View className="flex-row items-center justify-between">
            <Text variant="title3" className="font-display">
              {t.photosTitle}
            </Text>
            <View style={{ width: 170 }}>
              <Segmented
                options={[
                  { value: 'before', label: t.photosBefore },
                  { value: 'after', label: t.photosAfter },
                ]}
                value={photoPhase}
                onChange={setPhotoPhase}
              />
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2.5">
            {photos.map((photo) => (
              <View key={photo.id} className="gap-1.5" style={{ width: '47%' }}>
                <View
                  className="h-[132px] items-center justify-center rounded-2xl"
                  style={{ backgroundColor: photoPhase === 'before' ? colors.dangerSoft : colors.successSoft }}
                >
                  <Icon name="photo" size={28} color={photoPhase === 'before' ? colors.danger : colors.successInk} />
                </View>
                <Text variant="caption" className="font-body-bold" numberOfLines={1}>
                  {photo.caption}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View className="gap-2.5 px-5 pt-5">
        <Text variant="title3" className="font-display">
          {t.materialsTitle}
        </Text>
        <View className="rounded-xl border border-border-subtle bg-surface p-4">
          <View className="flex-row justify-between pb-2">
            <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
              {t.materialsHeaders.item}
            </Text>
            <Text variant="micro" tone="secondary" className="normal-case tracking-normal">
              {t.materialsHeaders.price}
            </Text>
          </View>
          {report.materials.map((m, i) => (
            <View
              key={m.label}
              className={`flex-row items-center justify-between py-2 ${i < report.materials.length - 1 ? 'border-b border-border-subtle' : ''}`}
            >
              <Text variant="body" numberOfLines={1} className="flex-1">
                {m.label} {m.qty > 1 ? `×${m.qty}` : ''}
              </Text>
              <Text variant="body" className="font-body-bold">
                {formatFCFA(m.qty * m.unitPrice)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-2.5 px-5 pt-5">
        <Text variant="title3" className="font-display">
          {t.totalTitle}
        </Text>
        <View className="gap-2 rounded-xl border border-border-subtle bg-surface p-4">
          <View className="flex-row justify-between">
            <Text variant="body" tone="secondary">
              {t.labor}
            </Text>
            <Text variant="body">{formatFCFA(report.labor)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="body" tone="secondary">
              {t.travel}
            </Text>
            <Text variant="body">{formatFCFA(report.travel)}</Text>
          </View>
          <View className="flex-row justify-between border-b border-border-subtle pb-2">
            <Text variant="body" tone="secondary">
              {t.materials}
            </Text>
            <Text variant="body">{formatFCFA(materialsTotal)}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text variant="label" className="font-body-extrabold">
              {t.total}
            </Text>
            <Text variant="title2" className="font-display">
              {formatFCFA(total)}
            </Text>
          </View>
          {booking.priceEstimate && inRange ? (
            <View className="flex-row items-center gap-2 pt-1">
              <Icon name="check" size={16} color={colors.successInk} />
              <Text variant="caption" className="text-success-ink">
                {t.inRange(`${formatFCFA(booking.priceEstimate.min)} – ${formatFCFA(booking.priceEstimate.max)}`)}
              </Text>
            </View>
          ) : null}
          <View className="flex-row items-center gap-2">
            <Icon name="shield" size={16} color={colors.primary} />
            <Text variant="caption" className="text-primary">
              {t.warranty(report.warrantyDays)}
            </Text>
          </View>
        </View>
      </View>

      <View className="gap-2.5 px-5 pt-6">
        <Button
          variant="primary"
          loading={validateReportMutation.isPending}
          onPress={() =>
            validateReportMutation.mutate(id, {
              onSuccess: () => router.push(`/bookings/${id}/review`),
            })
          }
        >
          {t.confirmCta}
        </Button>
        <View className="flex-row gap-2.5">
          <Pressable
            onPress={() => router.push(`/bookings/${id}`)}
            accessibilityRole="button"
            className="h-11 flex-1 flex-row items-center justify-center gap-1.5"
          >
            <Icon name="flag" size={16} color={colors.danger} />
            <Text variant="caption" className="font-body-bold text-danger">
              {t.reportIssue}
            </Text>
          </Pressable>
          <Button variant="secondary" size="sm" icon="download" className="flex-1" onPress={downloadPdf}>
            {t.downloadPdf}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
