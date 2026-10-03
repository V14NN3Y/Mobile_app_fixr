/**
 * Code SMS — design/Otp.dc.html.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, View, type TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { OtpInput, type OtpInputStatus } from '@/components/ui/OtpInput';
import { Text } from '@/components/ui/Text';
import { BackButton } from '@/features/auth/components/BackButton';
import { ApiError } from '@/mocks/api';
import { useVerifyOtp } from '@/features/auth/hooks';
import { useSessionStore } from '@/features/auth/store';
import { fr } from '@/lib/i18n/fr';
import { useTheme } from '@/theme/useTheme';

const RESEND_SECONDS = 60;

/** "0197451236" → "01 97 45 •• 36" (le 4e groupe masqué, comme la maquette). */
function maskPhone(local: string): string {
  const groups = local.match(/.{1,2}/g) ?? [];
  return groups.map((g, i) => (i === 3 ? '••' : g)).join(' ');
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VerifyOtp() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { phone = '' } = useLocalSearchParams<{ phone?: string }>();
  const t = fr.auth.otp;
  const signIn = useSessionStore((s) => s.signIn);
  const inputRef = useRef<TextInput>(null);

  const [code, setCode] = useState('');
  const [status, setStatus] = useState<OtpInputStatus>('default');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const verifyOtp = useVerifyOtp();
  const lastVerifiedUser = useRef<{ userId: string; phone: string } | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const onChangeCode = (value: string) => {
    setCode(value);
    if (status !== 'default') setStatus('default');
    if (errorMessage) setErrorMessage(null);
  };

  const onVerify = async () => {
    try {
      const user = await verifyOtp.mutateAsync({ phone, code });
      setStatus('success');
      AccessibilityInfo.announceForAccessibility(t.verified);
      // signIn() n'est déclenché qu'au tap sur « Continuer » (voir plus bas), pas ici.
      lastVerifiedUser.current = user;
    } catch (e) {
      setStatus('error');
      setErrorMessage(e instanceof ApiError ? e.message : fr.auth.common.networkError);
      AccessibilityInfo.announceForAccessibility(
        e instanceof ApiError ? e.message : fr.auth.common.networkError,
      );
      setCode('');
      inputRef.current?.focus();
    }
  };

  const onResend = () => {
    setSecondsLeft(RESEND_SECONDS);
    AccessibilityInfo.announceForAccessibility('Code renvoyé');
  };

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="h-[52px] flex-row items-center px-3" style={{ marginTop: insets.top }}>
        <BackButton onPress={() => router.push('/login')} />
      </View>

      <View className="gap-6 px-5">
        <View className="gap-2">
          <Text variant="title1" className="font-display">
            {t.title}
          </Text>
          <Text variant="bodyLg" tone="secondary">
            {t.sentToPrefix}
            <Text variant="bodyLg" className="font-body-bold text-text">
              +229 {maskPhone(phone)}
            </Text>
            {t.sentToSuffix}{' '}
            <Text
              variant="bodyLg"
              className="font-body-bold text-primary"
              onPress={() => router.push('/login')}
            >
              {t.edit}
            </Text>
          </Text>
        </View>

        {status !== 'success' ? (
          <View className="gap-2">
            <OtpInput
              ref={inputRef}
              value={code}
              onChange={onChangeCode}
              status={status}
              disabled={verifyOtp.isPending}
              accessibilityLabel={t.digitsEntered(code.length)}
            />
            {errorMessage ? (
              <Text variant="caption" className="text-danger" accessibilityRole="alert">
                {errorMessage}
              </Text>
            ) : null}
          </View>
        ) : (
          <View className="flex-row items-center gap-2">
            <Icon name="check" size={20} color={colors.successInk} />
            <Text variant="label" className="text-success-ink">
              {t.verified}
            </Text>
          </View>
        )}

        {status !== 'success' ? (
          <View className="items-center">
            {secondsLeft > 0 ? (
              <Text variant="caption" tone="secondary">
                {t.resendPrefix}
                <Text variant="caption" className="font-body-bold text-text">
                  {formatCountdown(secondsLeft)}
                </Text>
              </Text>
            ) : (
              <Text variant="caption" className="font-body-bold text-primary" onPress={onResend}>
                {t.resendCta}
              </Text>
            )}
          </View>
        ) : null}
      </View>

      <View className="mt-auto gap-3 px-5 pt-8">
        {status === 'success' ? (
          <Button
            variant="primary"
            onPress={() => lastVerifiedUser.current && signIn(lastVerifiedUser.current)}
          >
            {t.continueCta}
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={code.length < 6}
            loading={verifyOtp.isPending}
            onPress={onVerify}
          >
            {t.verify}
          </Button>
        )}
      </View>
    </ScrollView>
  );
}
