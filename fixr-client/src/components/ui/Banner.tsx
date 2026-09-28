/**
 * Bandeau — design/Components.dc.html « Toasts & alertes » (info/warning/error/offline).
 * Texte 14/700 = variante `label`, sans ajustement.
 */
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/useTheme';

import { Icon } from './Icon';
import { Text } from './Text';

export type BannerTone = 'info' | 'warning' | 'error' | 'offline';

export type BannerProps = {
  tone: BannerTone;
  children: string;
  testID?: string;
};

const bgClass: Record<BannerTone, string> = {
  info: 'bg-primary-soft',
  warning: 'bg-warning-soft',
  error: 'bg-danger-soft',
  offline: 'bg-offline-bg',
};

const textClass: Record<BannerTone, string> = {
  info: 'text-primary',
  warning: 'text-warning-ink',
  error: 'text-danger-ink',
  offline: 'text-offline-text',
};

export function Banner({ tone, children, testID }: BannerProps) {
  const { colors } = useTheme();

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      className={cn('flex-row items-center gap-2 rounded-lg px-3.5 py-3', bgClass[tone])}
    >
      {tone === 'offline' ? <Icon name="wifiOff" size={18} color={colors.offlineText} /> : null}
      <Text variant="label" tone="inherit" className={cn('flex-1', textClass[tone])}>
        {children}
      </Text>
    </View>
  );
}
