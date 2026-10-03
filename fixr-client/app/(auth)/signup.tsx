/**
 * Inscription — design/Signup.dc.html + design/SignupErrors.dc.html.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { BackButton } from '@/features/auth/components/BackButton';
import { PasswordCriteriaChecklist } from '@/features/auth/components/PasswordCriteriaChecklist';
import { TermsCheckbox } from '@/features/auth/components/TermsCheckbox';
import { useSignUp } from '@/features/auth/hooks';
import { getPasswordScore, getPasswordStrengthLabel } from '@/features/auth/password';
import { signUpSchema, type SignUpFormValues } from '@/features/auth/schemas';
import { fr } from '@/lib/i18n/fr';
import { ApiError } from '@/mocks/api';

export default function Signup() {
  const insets = useSafeAreaInsets();
  const t = fr.auth.signup;
  const [phoneExists, setPhoneExists] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const signUp = useSignUp();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      acceptTerms: false as true, // zod exige littéralement `true` ; false = état initial invalide, normal avant la 1re soumission
    },
  });

  const acceptTerms = useWatch({ control, name: 'acceptTerms' });
  const password = useWatch({ control, name: 'password' });
  const errorCount = Object.keys(errors).length;
  const passwordScore = getPasswordScore(password);

  const onSubmit = handleSubmit(async (values) => {
    setBannerError(null);
    setPhoneExists(false);
    try {
      const { phone } = await signUp.mutateAsync(values);
      router.push({ pathname: '/verify-otp', params: { phone } });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setPhoneExists(true);
      } else {
        setBannerError(fr.auth.common.networkError);
      }
    }
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View
        className="h-[52px] flex-row items-center justify-between px-3"
        style={{ marginTop: insets.top }}
      >
        <BackButton onPress={() => router.push('/onboarding')} />
        <Text variant="label" className="pr-2 text-primary" onPress={() => router.push('/login')}>
          {t.signIn}
        </Text>
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

        {isSubmitted && errorCount > 0 ? (
          <Banner tone="error">{t.errorsBanner(errorCount)}</Banner>
        ) : null}
        {bannerError ? <Banner tone="error">{bannerError}</Banner> : null}

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="firstName"
              render={({ field, fieldState }) => (
                <TextField
                  label={t.firstName}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  autoComplete="given-name"
                  textContentType="givenName"
                  returnKeyType="next"
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState }) => (
                <TextField
                  label={t.lastName}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  autoComplete="family-name"
                  textContentType="familyName"
                  returnKeyType="next"
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <TextField
              label={t.phoneLabel}
              prefix={t.phonePrefix}
              value={field.value}
              onChangeText={(v) => {
                field.onChange(v);
                if (phoneExists) setPhoneExists(false);
              }}
              onBlur={field.onBlur}
              error={
                phoneExists ? (
                  <Text variant="caption" className="text-danger">
                    {t.phoneAlreadyExists}{' '}
                    <Text
                      variant="caption"
                      className="font-body-extrabold text-danger underline"
                      onPress={() => router.push('/login')}
                    >
                      {t.signIn}
                    </Text>
                  </Text>
                ) : (
                  fieldState.error?.message
                )
              }
              inputMode="tel"
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              label={t.emailLabel}
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

        <View className="gap-2">
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              // error=' ' (espace insécable) : fait passer TextField en style erreur
              // (bordure/fond) sans dupliquer de texte — le détail vient de
              // PasswordCriteriaChecklist juste en dessous, pas d'un second message.
              <TextField
                label={t.passwordLabel}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error ? ' ' : undefined}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
            )}
          />
          {errors.password ? (
            <PasswordCriteriaChecklist password={password} />
          ) : password ? (
            <PasswordStrengthMeter
              score={passwordScore}
              label={getPasswordStrengthLabel(passwordScore)}
            />
          ) : null}
        </View>

        <Controller
          control={control}
          name="acceptTerms"
          render={({ field }) => (
            <TermsCheckbox
              checked={field.value}
              onChange={field.onChange}
              error={isSubmitted && !field.value}
            />
          )}
        />

        <Button
          variant="primary"
          disabled={!acceptTerms}
          loading={signUp.isPending}
          onPress={onSubmit}
        >
          {t.submit}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
