/**
 * Moyens de paiement — pas de maquette dédiée, style de Profile.dc.html (docs/ECRANS.md).
 * « Espèces » (kind='cash') traité comme un repli permanent, non supprimable — aucune
 * maquette ne tranche la question, mais payer en espèces à l'artisan n'est pas un moyen à
 * ajouter/retirer comme un vrai enregistrement (décision du Lot 7, masquée côté écran
 * uniquement : features/payments/api.ts reste permissif).
 */
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { useAddPaymentMethod, usePaymentMethods, useRemovePaymentMethod, useSetDefaultPaymentMethod } from '@/features/payments/hooks';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';
import type { PaymentMethod } from '@/types/domain';

export default function Payments() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const t = fr.payments;
  const toast = useToast();

  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

  const methodsQuery = usePaymentMethods();
  const addMutation = useAddPaymentMethod();
  const removeMutation = useRemovePaymentMethod();
  const setDefaultMutation = useSetDefaultPaymentMethod();

  const digits = phone.replace(/\D/g, '');
  const canSubmit = digits.length >= 8;

  function handleSubmit() {
    const last2 = digits.slice(-2);
    addMutation.mutate(
      { kind: 'mobile_money', label: `Mobile Money •• ${last2}` },
      {
        onSuccess: () => {
          setShowForm(false);
          setPhone('');
          toast.show(t.addedToast);
        },
      },
    );
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteMutation(deleteTarget.id);
  }

  function deleteMutation(id: string) {
    removeMutation.mutate(id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.show(t.removedToast);
      },
    });
  }

  if (showForm) {
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
            accessibilityLabel={t.form.cancel}
            className="h-11 w-11 items-center justify-center rounded-xl"
          >
            <Icon name="chevronLeft" size={22} color={colors.text} />
          </Pressable>
          <Text variant="title2" className="font-display">
            {t.form.title}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
          <TextField
            label={t.form.phoneLabel}
            value={phone}
            onChangeText={setPhone}
            inputMode="tel"
            prefix="+229"
            placeholder="01 97 XX XX XX"
          />
        </ScrollView>

        <View className="border-t border-border-subtle bg-surface px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
          <Button variant="primary" disabled={!canSubmit} loading={addMutation.isPending} onPress={handleSubmit}>
            {t.form.submit}
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

      {methodsQuery.isLoading ? (
        <View className="gap-3 px-5" style={{ paddingTop: 20 }}>
          <Skeleton height={76} rounded={20} />
          <Skeleton height={76} rounded={20} />
        </View>
      ) : methodsQuery.isError || !methodsQuery.data ? (
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <Banner tone="error">{t.error.title}</Banner>
          <Button variant="primary" onPress={() => methodsQuery.refetch()}>
            {t.error.retry}
          </Button>
        </View>
      ) : methodsQuery.data.length === 0 ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          <EmptyState icon="card" title={t.empty.title} description={t.empty.description}>
            <Button variant="primary" onPress={() => setShowForm(true)}>
              {t.addNew}
            </Button>
          </EmptyState>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: insets.bottom + 24 }}>
          {methodsQuery.data.map((method) => (
            <View key={method.id} className="gap-2.5 rounded-2xl border border-border-subtle bg-surface p-3.5">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-muted">
                  <Icon name="card" size={20} color={colors.text} />
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <View className="flex-row items-center gap-2">
                    <Text variant="label" className="font-body-extrabold" numberOfLines={1}>
                      {method.kind === 'cash' ? t.cashLabel : method.label}
                    </Text>
                    {method.isDefault ? (
                      <View className="rounded-full bg-primary-soft px-2 py-0.5">
                        <Text variant="micro" className="normal-case tracking-normal text-primary">
                          {t.defaultBadge}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  {method.kind === 'cash' ? (
                    <Text variant="caption" tone="secondary">
                      {t.cashHint}
                    </Text>
                  ) : null}
                </View>
                {method.kind !== 'cash' ? (
                  <Pressable
                    onPress={() => setDeleteTarget(method)}
                    accessibilityRole="button"
                    accessibilityLabel={t.delete}
                    className="h-9 w-9 items-center justify-center"
                  >
                    <Icon name="trash" size={18} color={colors.danger} />
                  </Pressable>
                ) : null}
              </View>
              {!method.isDefault ? (
                <Pressable
                  onPress={() =>
                    setDefaultMutation.mutate(method.id, { onSuccess: () => toast.show(t.defaultToast) })
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
            onPress={() => setShowForm(true)}
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
        title={t.deleteConfirmTitle}
        confirmLabel={t.deleteConfirmCta}
        cancelLabel={t.deleteCancelCta}
        destructive
        loading={removeMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
