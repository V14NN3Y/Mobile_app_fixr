/**
 * Demande — étape 1 « Besoin » — design/RequestNeed.dc.html.
 */
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Icon } from '@/components/ui/Icon';
import { Radio } from '@/components/ui/Radio';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stepper } from '@/components/ui/Stepper';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useArtisan } from '@/features/artisans/hooks';
import { useCategories } from '@/features/categories/hooks';
import { needSchema } from '@/features/request/schemas';
import { useRequestStore } from '@/features/request/store';
import { fr } from '@/lib/i18n/fr';
import type { CategoryId } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { Urgency } from '@/types/domain';

const URGENCIES: Urgency[] = ['now', 'week', 'flexible'];
const MAX_MEDIA = 6;
const MAX_TITLE = 60;

export default function RequestNeed() {
  const insets = useSafeAreaInsets();
  const { colors, categoryTints } = useTheme();
  const t = fr.request;
  const params = useLocalSearchParams<{ artisanId?: string; categoryId?: CategoryId }>();

  const draft = useRequestStore((s) => s.draft);
  const setField = useRequestStore((s) => s.setField);
  const addMedia = useRequestStore((s) => s.addMedia);
  const removeMedia = useRequestStore((s) => s.removeMedia);
  const seedFromArtisan = useRequestStore((s) => s.seedFromArtisan);
  const seedFromCategory = useRequestStore((s) => s.seedFromCategory);
  const isDirty = useRequestStore((s) => s.isDirty);
  const reset = useRequestStore((s) => s.reset);

  const categoriesQuery = useCategories();
  const artisanQuery = useArtisan(params.artisanId ?? '', Boolean(params.artisanId));
  const [confirmAbandon, setConfirmAbandon] = useState(false);

  useEffect(() => {
    if (draft.categoryId !== undefined) return;
    if (params.artisanId) {
      if (artisanQuery.data) seedFromArtisan(artisanQuery.data);
    } else if (params.categoryId) {
      seedFromCategory(params.categoryId);
    } else if (categoriesQuery.data?.[0]) {
      // Comme la maquette (state démo toujours initialisé avec une catégorie), une
      // catégorie est toujours sélectionnée par défaut — sans ça, needSchema (qui exige
      // categoryId) bloquerait Continuer même avec un titre valide.
      seedFromCategory(categoriesQuery.data[0].id);
    }
  }, [
    params.artisanId,
    params.categoryId,
    artisanQuery.data,
    draft.categoryId,
    categoriesQuery.data,
    seedFromArtisan,
    seedFromCategory,
  ]);

  const canContinue = needSchema.safeParse(draft).success;

  function handleClose() {
    if (isDirty()) {
      setConfirmAbandon(true);
    } else {
      router.replace('/');
    }
  }

  async function pickMedia() {
    if (draft.media.length >= MAX_MEDIA) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.6,
      selectionLimit: MAX_MEDIA - draft.media.length,
      allowsMultipleSelection: true,
    });
    if (result.canceled) return;
    for (const asset of result.assets.slice(0, MAX_MEDIA - draft.media.length)) {
      addMedia({
        id: asset.assetId ?? `${asset.uri}-${Date.now()}`,
        kind: asset.type === 'video' ? 'video' : 'photo',
        uri: asset.uri,
        durationSec: asset.duration ? Math.round(asset.duration / 1000) : undefined,
      });
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="gap-3 border-b border-border-subtle bg-bg px-2 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.replace('/')}
            accessibilityRole="button"
            accessibilityLabel={fr.auth.common.back}
            className="h-11 w-11 items-center justify-center"
          >
            <Icon name="chevronLeft" size={22} color={colors.text} />
          </Pressable>
          <Text variant="label" className="font-body-extrabold">
            {t.common.newRequestTitle}
          </Text>
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel={t.common.cancelLabel}
            className="h-11 w-11 items-center justify-center"
          >
            <Icon name="close" size={22} color={colors.text} />
          </Pressable>
        </View>
        <View className="px-3">
          <Stepper steps={t.common.steps} currentIndex={0} />
        </View>
      </View>

      {categoriesQuery.isLoading ? (
        <View className="flex-1 gap-4 px-5" style={{ paddingTop: 20 }}>
          <Skeleton height={24} width="60%" />
          <Skeleton height={56} rounded={16} />
          <Skeleton height={120} rounded={20} />
        </View>
      ) : categoriesQuery.isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <Banner tone="error">{fr.auth.common.networkError}</Banner>
          <Button variant="primary" onPress={() => categoriesQuery.refetch()}>
            {fr.auth.common.retry}
          </Button>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 24, gap: 22 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text variant="title2" className="font-display">
              {t.besoin.title}
            </Text>

            <View className="gap-3">
              <Text variant="label" className="font-body-extrabold">
                {t.besoin.categoryLabel}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {(categoriesQuery.data ?? []).map((c) => {
                  const selected = draft.categoryId === c.id;
                  const tint = categoryTints[c.id];
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setField('categoryId', c.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      className="h-11 flex-row items-center gap-2 rounded-xl border px-3"
                      style={{
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? colors.primarySoft : colors.surface,
                      }}
                    >
                      <Icon name={c.id} size={18} color={tint.ink} />
                      <Text variant="label" className="font-body-bold">
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <TextField
              label={`${t.besoin.titleLabel} · ${draft.title.length}/${MAX_TITLE}`}
              value={draft.title}
              onChangeText={(v) => setField('title', v.slice(0, MAX_TITLE))}
              placeholder={t.besoin.titlePlaceholder}
              maxLength={MAX_TITLE}
              returnKeyType="next"
            />

            <TextField
              label={t.besoin.descriptionLabel}
              hint={t.besoin.descriptionHelp}
              value={draft.description}
              onChangeText={(v) => setField('description', v)}
              multiline
              numberOfLines={4}
            />

            <View className="gap-2.5">
              <View className="flex-row items-baseline justify-between">
                <Text variant="label" className="font-body-extrabold">
                  {t.besoin.mediaLabel}
                </Text>
                <Text variant="caption" tone="secondary">
                  {t.besoin.mediaCount(draft.media.length)}
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2.5">
                {draft.media.map((m) => (
                  <View key={m.id} className="relative">
                    <View className="h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
                      <Icon
                        name={m.kind === 'video' ? 'play' : 'photo'}
                        size={28}
                        color={colors.textTertiary}
                        filled={m.kind === 'video'}
                      />
                      {m.kind === 'video' && m.durationSec !== undefined ? (
                        <View className="absolute bottom-1.5 right-1.5 rounded-full bg-text/80 px-1.5 py-0.5">
                          <Text variant="micro" className="normal-case tracking-normal text-bg">
                            0:{String(m.durationSec).padStart(2, '0')}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => removeMedia(m.id)}
                      accessibilityRole="button"
                      accessibilityLabel={t.besoin.removeMedia(
                        m.kind === 'video' ? 'la vidéo' : 'la photo',
                      )}
                      className="absolute -right-1.5 -top-1.5 h-6 w-6 items-center justify-center rounded-full border-2 border-bg bg-text"
                    >
                      <Icon name="close" size={12} color={colors.bg} />
                    </Pressable>
                  </View>
                ))}
                {draft.media.length < MAX_MEDIA ? (
                  <Pressable
                    onPress={pickMedia}
                    accessibilityRole="button"
                    accessibilityLabel={t.besoin.addMedia}
                    className="h-[84px] w-[84px] items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed border-border-strong"
                  >
                    <Icon name="plus" size={20} color={colors.primary} />
                    <Text variant="caption" className="font-body-bold text-primary">
                      {t.besoin.addMedia}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View className="gap-2">
              <Text variant="label" className="font-body-extrabold">
                {t.besoin.urgencyLabel}
              </Text>
              {URGENCIES.map((u) => {
                const selected = draft.urgency === u;
                const info = t.besoin.urgency[u];
                return (
                  <View
                    key={u}
                    className="min-h-[60px] flex-row items-center gap-3 rounded-2xl border px-3.5 py-2"
                    style={{ borderColor: selected ? colors.primary : colors.border }}
                  >
                    <Radio selected={selected} onSelect={() => setField('urgency', u)} />
                    <Pressable
                      onPress={() => setField('urgency', u)}
                      accessibilityRole="none"
                      className="min-h-touch flex-1 justify-center gap-0.5"
                    >
                      <Text variant="label" className="font-body-bold">
                        {info.label}
                      </Text>
                      <Text variant="caption" tone="secondary">
                        {info.help}
                      </Text>
                    </Pressable>
                    {info.tag ? (
                      <Text variant="caption" className="font-body-extrabold text-accent-ink">
                        {info.tag}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>

            <View className="gap-1.5">
              <TextField
                label={`${t.besoin.budgetLabel} · ${t.besoin.budgetOptional}`}
                value={draft.budget !== undefined ? String(draft.budget) : ''}
                onChangeText={(v) => {
                  const n = Number(v.replace(/\D/g, ''));
                  setField('budget', v === '' ? undefined : Number.isFinite(n) ? n : undefined);
                }}
                inputMode="numeric"
                accessory={
                  <Text variant="label" tone="secondary" className="font-body-bold">
                    {t.besoin.budgetSuffix}
                  </Text>
                }
              />
              {draft.categoryId === 'climatisation' ? (
                <Text variant="caption" tone="secondary">
                  {t.besoin.budgetHelpClimatisation}
                </Text>
              ) : null}
            </View>
          </ScrollView>

          <View
            className="border-t border-border-subtle bg-surface px-5 pb-4 pt-3"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <Button
              variant="primary"
              disabled={!canContinue}
              icon={canContinue ? 'chevronRight' : undefined}
              onPress={() => router.push('/request/address')}
            >
              {canContinue ? t.common.continueCta : t.besoin.continueDisabled}
            </Button>
          </View>
        </>
      )}

      <ConfirmDialog
        visible={confirmAbandon}
        title={t.common.abandonTitle}
        confirmLabel={t.common.abandonConfirm}
        cancelLabel={t.common.abandonCancel}
        destructive
        onConfirm={() => {
          reset();
          setConfirmAbandon(false);
          router.replace('/');
        }}
        onCancel={() => setConfirmAbandon(false)}
      />
    </KeyboardAvoidingView>
  );
}
