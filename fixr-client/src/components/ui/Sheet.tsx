/**
 * Panneau du bas — design/Components.dc.html « Bottom sheet & modale » (@gorhom/bottom-sheet).
 * Coins hauts 22, poignée 40×5 border-strong, fond surface, voile scrim, 320 ms (tokens.motion).
 * <BottomSheetModalProvider> doit englober l'app (posé dans app/_layout.tsx).
 */
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useMemo, type ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { motion } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export type SheetProps = {
  children: ReactNode;
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
  onDismiss?: () => void;
  testID?: string;
};

/** Sheet à taille de contenu par défaut (comme « Trier par ») : pas de snapPoints requis. */
export const Sheet = forwardRef<BottomSheetModal, SheetProps>(function Sheet(
  { children, snapPoints, enableDynamicSizing = true, onDismiss, testID },
  ref,
) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const animationConfigs = useMemo(() => ({ duration: motion.duration.sheet }), []);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={enableDynamicSizing ? undefined : snapPoints}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose
      onDismiss={onDismiss}
      animationConfigs={animationConfigs}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
      }}
      handleIndicatorStyle={{ backgroundColor: colors.borderStrong, width: 40, height: 5 }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          style={[props.style, { backgroundColor: colors.scrim }]}
        />
      )}
    >
      <BottomSheetView
        testID={testID}
        style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20, gap: 16 }}
      >
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export type SheetRef = BottomSheetModal;
