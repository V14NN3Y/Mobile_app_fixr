/**
 * Connexion — design/Login.dc.html (onglets Téléphone / E-mail).
 * Aucun état d'erreur maquetté sur cet écran (hors échec réseau simulé) : les schémas
 * bloquent juste la soumission tant que le format est invalide.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { BackButton } from '@/features/auth/components/BackButton';
import { useRequestOtp, useSignInWithEmail } from '@/features/auth/hooks';
import {
  loginEmailSchema,
  loginPhoneSchema,
  type LoginEmailFormValues,
  type LoginPhoneFormValues,
} from '@/features/auth/schemas';
import { useSessionStore } from '@/features/auth/store';
import { fr } from '@/lib/i18n/fr';

type Method = 'phone' | 'email';

/**
 * Bouton SSO — design/Login.dc.html (badge carré lettre + libellé). Pas dans le kit ui/ :
 * spécifique à cet écran (visuel, sans logique SSO réelle — voir décision 3 du plan).
 */
function SsoButton({
  letter,
  label,
  onPress,
}: {
  letter: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-button flex-row items-center justify-center gap-2 rounded-lg border-[1.5px] border-border-strong bg-surface px-[18px] active:border-text active:bg-bg"
    >
      <View className="h-[22px] w-[22px] items-center justify-center rounded-[6px] border-[1.5px] border-border-strong">
        <Text variant="label">{letter}</Text>
      </View>
      <Text variant="label">{label}</Text>
    </Pressable>
  );
}

export default function Login() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const t = fr.auth.login;
  const [method, setMethod] = useState<Method>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const signIn = useSessionStore((s) => s.signIn);
  const requestOtp = useRequestOtp();
  const signInWithEmail = useSignInWithEmail();

  const phoneForm = useForm<LoginPhoneFormValues>({
    resolver: zodResolver(loginPhoneSchema),
    defaultValues: { phone: '' },
  });
  const emailForm = useForm<LoginEmailFormValues>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmitPhone = phoneForm.handleSubmit(async (values) => {
    setNetworkError(null);
    try {
      const { phone } = await requestOtp.mutateAsync(values.phone);
      router.push({ pathname: '/verify-otp', params: { phone } });
    } catch {
      setNetworkError(fr.auth.common.networkError);
    }
  });

  const onSubmitEmail = emailForm.handleSubmit(async (values) => {
    setNetworkError(null);
    try {
      const user = await signInWithEmail.mutateAsync(values);
      signIn(user);
    } catch {
      setNetworkError(fr.auth.common.networkError);
    }
  });

  const isSubmitting = requestOtp.isPending || signInWithEmail.isPending;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View className="h-[52px] flex-row items-center px-3" style={{ marginTop: insets.top }}>
        <BackButton />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2">
          <Text variant="title1" className="font-display">
            {t.title}
          </Text>
          <Text variant="bodyLg" tone="secondary">
            {t.subtitle}
          </Text>
        </View>

        <Segmented
          options={[
            { value: 'phone', label: t.tabPhone },
            { value: 'email', label: t.tabEmail },
          ]}
          value={method}
          onChange={(v) => {
            setMethod(v);
            setNetworkError(null);
          }}
        />

        {networkError ? <Banner tone="error">{networkError}</Banner> : null}

        {method === 'phone' ? (
          <View className="gap-5">
            <Controller
              control={phoneForm.control}
              name="phone"
              render={({ field, fieldState }) => (
                <TextField
                  label={t.phoneLabel}
                  prefix={t.phonePrefix}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  hint={fieldState.error ? undefined : t.phoneHint}
                  inputMode="tel"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  returnKeyType="done"
                  onSubmitEditing={onSubmitPhone}
                />
              )}
            />
            <Button variant="primary" loading={isSubmitting} onPress={onSubmitPhone}>
              {t.receiveCode}
            </Button>
          </View>
        ) : (
          <View className="gap-5">
            <Controller
              control={emailForm.control}
              name="email"
              render={({ field, fieldState }) => (
                <TextField
                  label={t.emailLabel}
                  icon="mail"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
              )}
            />

            <View className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text variant="label">{t.passwordLabel}</Text>
                <Text
                  variant="label"
                  className="text-primary"
                  onPress={() => toast.show(t.forgotPasswordComingSoon)}
                >
                  {t.forgotPassword}
                </Text>
              </View>
              <Controller
                control={emailForm.control}
                name="password"
                render={({ field, fieldState }) => (
                  <TextField
                    icon="lock"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    secureTextEntry={!showPassword}
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={onSubmitEmail}
                    accessory={
                      <Button
                        iconOnly
                        size="md"
                        variant="tertiary"
                        icon={showPassword ? 'eyeOff' : 'eye'}
                        accessibilityLabel={showPassword ? t.hidePassword : t.showPassword}
                        onPress={() => setShowPassword((v) => !v)}
                      />
                    }
                  />
                )}
              />
            </View>

            <Button variant="primary" loading={isSubmitting} onPress={onSubmitEmail}>
              {t.signIn}
            </Button>
          </View>
        )}

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text variant="caption" tone="tertiary">
            {t.or}
          </Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <View className="gap-3">
          <SsoButton
            letter="G"
            label={t.continueWithGoogle}
            onPress={() => toast.show(t.ssoComingSoon('Google'))}
          />
          <SsoButton
            letter="A"
            label={t.continueWithApple}
            onPress={() => toast.show(t.ssoComingSoon('Apple'))}
          />
        </View>

        <View className="flex-row items-center justify-center gap-1.5 pt-2">
          <Text variant="body" tone="secondary">
            {t.noAccountYet}
          </Text>
          <Text
            variant="body"
            className="font-body-extrabold text-primary"
            onPress={() => router.push('/signup')}
          >
            {t.createAccount}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
