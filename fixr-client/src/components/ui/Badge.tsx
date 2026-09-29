/**
 * Badge — design/Components.dc.html « Badges & avatars » + « Barre de navigation ».
 * mode="status" : tokens.statusTone (puce ● + libellé). mode="verification" : 3 niveaux.
 * mode="count" : pastille numérique (barre d'onglets, cloche de notifications — Lot 6).
 * Taille du texte status/verification (12/800) absente des 9 variantes de <Text> :
 * dérivée de `micro` (même graisse/famille), sans majuscules ni tracking.
 */
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { colorClasses } from '@/theme/colorClasses';
import { statusTone } from '@/theme/tokens';
import type { BookingStatus, VerificationLevel } from '@/types/domain';

import { Text } from './Text';

export type BadgeProps =
  | { mode: 'status'; status: BookingStatus; testID?: string }
  | { mode: 'verification'; level: VerificationLevel; testID?: string }
  | { mode: 'count'; value: number; max?: number; testID?: string };

const verificationContent: Record<VerificationLevel, { label: string; bg: string; text: string }> =
  {
    identity: { label: '1 · Identité vérifiée', bg: 'bg-primary-soft', text: 'text-primary' },
    skills: { label: '2 · Compétences vérifiées', bg: 'bg-primary', text: 'text-on-primary' },
    pro: { label: '3 · Pro certifié', bg: 'bg-text', text: 'text-surface' },
  };

export function Badge(props: BadgeProps) {
  if (props.mode === 'count') {
    const { value, max = 99, testID } = props;
    const display = value > max ? `${max}+` : String(value);
    return (
      <View
        testID={testID}
        className="h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-surface bg-accent px-1"
      >
        <Text
          variant="micro"
          tone="inherit"
          className="normal-case tracking-normal text-on-accent"
          style={{ fontSize: 10, lineHeight: 12 }}
          numberOfLines={1}
        >
          {display}
        </Text>
      </View>
    );
  }

  const { mode, testID } = props;

  const { label, bg, fg, dot } =
    mode === 'status'
      ? (() => {
          const tone = statusTone[props.status];
          const cls = colorClasses[tone.bg];
          const fgCls = colorClasses[tone.fg];
          return { label: tone.label, bg: cls.bg, fg: fgCls.text, dot: fgCls.bg };
        })()
      : (() => {
          const v = verificationContent[props.level];
          return { label: v.label, bg: v.bg, fg: v.text, dot: undefined };
        })();

  return (
    <View
      testID={testID}
      className={cn('h-[26px] flex-row items-center gap-1.5 self-start rounded-full px-2.5', bg)}
    >
      {dot ? <View className={cn('h-1.5 w-1.5 rounded-full', dot)} /> : null}
      <Text
        variant="micro"
        className={cn(fg, 'normal-case tracking-normal')}
        style={{ fontSize: 12, lineHeight: 16 }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
