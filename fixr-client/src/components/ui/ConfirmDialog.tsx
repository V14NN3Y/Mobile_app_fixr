/**
 * Boîte de confirmation — design/Components.dc.html « Bottom sheet & modale ».
 * Le bouton de confirmation en tête (destructif ou primaire), l'option sûre en dessous.
 * Toucher le voile équivaut à annuler (chemin non destructif).
 */
import { Modal, Pressable, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';
import { elevation } from '@/theme/tokens';

import { Button } from './Button';
import { Text } from './Text';

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  loading?: boolean;
  testID?: string;
};

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
  loading = false,
  testID,
}: ConfirmDialogProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      testID={testID}
    >
      <Pressable
        onPress={onCancel}
        className="flex-1 items-center justify-center px-5"
        style={{ backgroundColor: colors.scrim }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={elevation.e3}
          className="w-full max-w-[420px] gap-2.5 rounded-xl bg-surface p-[18px]"
          accessibilityViewIsModal
          accessibilityRole="alert"
        >
          <Text variant="title3">{title}</Text>
          {description ? (
            <Text variant="caption" tone="secondary">
              {description}
            </Text>
          ) : null}
          <View className="mt-1.5 gap-2.5">
            <Button
              variant={destructive ? 'destructive' : 'primary'}
              size="md"
              loading={loading}
              onPress={onConfirm}
            >
              {confirmLabel}
            </Button>
            <Button variant="secondary" size="md" onPress={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
