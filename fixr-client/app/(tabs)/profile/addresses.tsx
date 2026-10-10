/**
 * Mes adresses — dérivé de design/StatesB.dc.html col. 3 (liste + toast de succès + flash
 * vert sur la ligne ajoutée) + design/RequestAddress.dc.html (style de carte). Aucune
 * maquette dédiée au formulaire d'ajout — champs dérivés du type Address.
 */
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import {
  useAddAddress,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from '@/features/addresses/hooks';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { Address } from '@/types/domain';

const CITIES: Address['city'][] = ['Cotonou', 'Abomey-Calavi', 'Porto-Novo'];

// Pas de géocodage réel disponible dans l'app : coordonnées approximées par ville
// (simplification assumée, même discipline que la position artisan synthétisée au Lot 5).
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Cotonou: { lat: 6.365, lng: 2.42 },
  'Abomey-Calavi': { lat: 6.449, lng: 2.356 },
  'Porto-Novo': { lat: 6.497, lng: 2.605 },
};

type FormState = {
  label: string;
  line: string;
  neighborhood: string;
  city: Address['city'];
  landmark: string;
  complement: string;
  accessInstructions: string;
};

const EMPTY_FORM: FormState = {
  label: '',
  line: '',
  neighborhood: '',
  city: 'Cotonou',
  landmark: '',
  complement: '',
  accessInstructions: '',
};

export default function Addresses() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.addresses;
  const toast = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const addressesQuery = useAddresses();
  const addMutation = useAddAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  useEffect(() => {
    if (!flashId) return;
    const timer = setTimeout(() => setFlashId(null), 1800);
    return () => clearTimeout(timer);
  }, [flashId]);

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(address: Address) {
    setEditingId(address.id);
    setForm({
      label: address.label,
      line: address.line,
      neighborhood: address.neighborhood,
      city: address.city,
      landmark: address.landmark ?? '',
      complement: address.complement ?? '',
      accessInstructions: address.accessInstructions ?? '',
    });
    setShowForm(true);
  }

  const canSubmit = Boolean(form.label.trim() && form.line.trim() && form.neighborhood.trim());

  function handleSubmitForm() {
    const payload = {
      label: form.label.trim(),
      line: form.line.trim(),
      neighborhood: form.neighborhood.trim(),
      city: form.city,
      landmark: form.landmark.trim() || undefined,
      complement: form.complement.trim() || undefined,
      accessInstructions: form.accessInstructions.trim() || undefined,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, patch: payload },
        {
          onSuccess: (updated) => {
            setShowForm(false);
            toast.show(t.updatedToast(updated.label));
          },
        },
      );
    } else {
      const coords = CITY_COORDS[form.city] ?? CITY_COORDS.Cotonou!;
      addMutation.mutate(
        { ...payload, ...coords, isDefault: false },
        {
          onSuccess: (added) => {
            setShowForm(false);
            setFlashId(added.id);
            toast.show(t.addedToast(added.label), {
              action: { label: t.toastUndo, onPress: () => deleteMutation.mutate(added.id) },
            });
          },
        },
      );
    }
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const label = deleteTarget.label;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.show(t.deletedToast(label));
      },
    });
  }

  if (showForm) {
    const formT = t.form;
    return (
      <View className="flex-1 bg-bg">
        <Stack.Screen options={{ headerShown: false }} />
        <View
          className="flex-row items-center gap-1.5 border-b border-border-subtle bg-bg px-2 pb-2"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable
            onPress={() => setShowForm(false)}
            accessibilityRole="button"
            accessibilityLabel={formT.cancel}
            className="h-11 w-11 items-center justify-center rounded-xl"
          >
            <Icon name="chevronLeft" size={22} color={colors.text} />
          </Pressable>
          <Text variant="title2" className="font-display">
            {editingId ? formT.editTitle : formT.addTitle}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
          <TextField
            label={formT.labelLabel}
            placeholder={formT.labelPlaceholder}
            value={form.label}
            onChangeText={(v) => setForm((f) => ({ ...f, label: v }))}
          />
          <TextField
            label={formT.lineLabel}
            value={form.line}
            onChangeText={(v) => setForm((f) => ({ ...f, line: v }))}
          />
          <TextField
            label={formT.neighborhoodLabel}
            value={form.neighborhood}
            onChangeText={(v) => setForm((f) => ({ ...f, neighborhood: v }))}
          />
          <View className="gap-1.5">
            <Text variant="label" className="font-body-extrabold">
              {formT.cityLabel}
            </Text>
            <Segmented
              options={CITIES.map((c) => ({ value: c, label: c }))}
              value={form.city}
              onChange={(v) => setForm((f) => ({ ...f, city: v }))}
            />
          </View>
          <TextField
            label={formT.landmarkLabel}
            value={form.landmark}
            onChangeText={(v) => setForm((f) => ({ ...f, landmark: v }))}
          />
          <TextField
            label={formT.complementLabel}
            value={form.complement}
            onChangeText={(v) => setForm((f) => ({ ...f, complement: v }))}
          />
          <TextField
            label={formT.accessLabel}
            value={form.accessInstructions}
            onChangeText={(v) => setForm((f) => ({ ...f, accessInstructions: v }))}
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        <View className="border-t border-border-subtle bg-surface px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
          <Button
            variant="primary"
            disabled={!canSubmit}
            loading={addMutation.isPending || updateMutation.isPending}
            onPress={handleSubmitForm}
          >
            {editingId ? formT.submitEdit : formT.submitAdd}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className="flex-row items-center gap-1.5 border-b border-border-subtle bg-bg px-2 pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel={fr.settings.backToProfile}
          className="h-11 w-11 items-center justify-center rounded-xl"
        >
          <Icon name="chevronLeft" size={22} color={colors.text} />
        </Pressable>
        <Text variant="title2" className="font-display">
          {t.title}
        </Text>
      </View>

      {addressesQuery.isLoading ? (
        <View className="gap-3 px-5" style={{ paddingTop: 20 }}>
          <Skeleton height={90} rounded={20} />
          <Skeleton height={90} rounded={20} />
        </View>
      ) : addressesQuery.isError || !addressesQuery.data ? (
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <Banner tone="error">{t.error.title}</Banner>
          <Button variant="primary" onPress={() => addressesQuery.refetch()}>
            {t.error.retry}
          </Button>
        </View>
      ) : addressesQuery.data.length === 0 ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          <EmptyState icon="location" title={t.empty.title} description={t.empty.description}>
            <Button variant="primary" onPress={openAddForm}>
              {t.addNew}
            </Button>
          </EmptyState>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: insets.bottom + 24 }}>
          {addressesQuery.data.map((address) => (
            <View
              key={address.id}
              className="gap-2.5 rounded-2xl border border-border-subtle p-3.5"
              style={{ backgroundColor: flashId === address.id ? colors.successSoft : colors.surface }}
            >
              <View className="flex-row items-start gap-3">
                <View className="min-w-0 flex-1 gap-0.5">
                  <View className="flex-row items-center gap-2">
                    <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
                      {address.label}
                    </Text>
                    {address.isDefault ? (
                      <View className="rounded-full bg-primary-soft px-2 py-0.5">
                        <Text variant="micro" className="normal-case tracking-normal text-primary">
                          {t.defaultBadge}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text variant="caption" tone="secondary" numberOfLines={2}>
                    {address.line}
                  </Text>
                </View>
                <Pressable
                  onPress={() => openEditForm(address)}
                  accessibilityRole="button"
                  accessibilityLabel={t.form.editTitle}
                  className="h-9 w-9 items-center justify-center"
                >
                  <Icon name="edit" size={18} color={colors.textTertiary} />
                </Pressable>
                <Pressable
                  onPress={() => setDeleteTarget(address)}
                  accessibilityRole="button"
                  accessibilityLabel={t.delete}
                  className="h-9 w-9 items-center justify-center"
                >
                  <Icon name="trash" size={18} color={colors.danger} />
                </Pressable>
              </View>
              {!address.isDefault ? (
                <Pressable
                  onPress={() =>
                    setDefaultMutation.mutate(address.id, {
                      onSuccess: () => toast.show(t.defaultToast(address.label)),
                    })
                  }
                  accessibilityRole="button"
                  className="self-start"
                >
                  <Text variant="caption" className="font-body-extrabold text-primary">
                    {t.setDefault}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ))}

          <Pressable
            onPress={openAddForm}
            accessibilityRole="button"
            className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-border-strong"
          >
            <Icon name="plus" size={18} color={colors.primary} />
            <Text variant="label" className="font-body-bold text-primary">
              {t.addNew}
            </Text>
          </Pressable>
        </ScrollView>
      )}

      <ConfirmDialog
        visible={Boolean(deleteTarget)}
        title={deleteTarget ? t.deleteConfirmTitle(deleteTarget.label) : ''}
        description={t.deleteConfirmDescription}
        confirmLabel={t.deleteConfirmCta}
        cancelLabel={t.deleteCancelCta}
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
