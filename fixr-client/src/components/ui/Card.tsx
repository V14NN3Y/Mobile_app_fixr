/**
 * Carte — conteneur générique (design/Components.dc.html : ArtisanCard, BookingCard…
 * partagent tous ce même conteneur : surface, r 20, bordure 1 border-subtle, p 14, gap 12).
 * `elevation` applique une ombre de tokens.elevation (sinon la carte reste à plat, comme
 * dans la maquette — l'ombre sert aux sheets/modales posées par-dessus le contenu).
 */
import type { ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';
import { elevation as elevationTokens } from '@/theme/tokens';

export type CardElevation = 'none' | 'e1' | 'e2' | 'e3';

export type CardProps = ViewProps & {
  children: ReactNode;
  elevation?: CardElevation;
  onPress?: () => void;
  className?: string;
  testID?: string;
};

export function Card({ children, elevation = 'none', onPress, className, testID, style, ...rest }: CardProps) {
  const shadowStyle = elevation === 'none' ? undefined : elevationTokens[elevation];
  const baseClassName = cn('gap-3 rounded-xl border border-border-subtle bg-surface p-3.5', className);

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        className={cn(baseClassName, 'active:bg-surface-muted')}
        style={[shadowStyle, style]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} className={baseClassName} style={[shadowStyle, style]} {...rest}>
      {children}
    </View>
  );
}
