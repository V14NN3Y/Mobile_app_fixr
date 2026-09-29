/**
 * Toast — design/Components.dc.html « Toasts & alertes » (bulle sombre, action « Annuler »).
 * Provider global : <ToastProvider> une fois à la racine, puis useToast().show(...) partout.
 * File d'attente simple (un toast affiché à la fois), annonce lecteur d'écran à l'apparition.
 */
import { create } from 'zustand';
import { useEffect, type ReactNode } from 'react';
import { AccessibilityInfo, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';

import { AnimatedView } from '@/lib/animated';
import { elevation, motion } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ToastAction = { label: string; onPress: () => void };

type ToastItem = {
  id: string;
  message: string;
  action?: ToastAction;
  durationMs: number;
  icon: IconName | null;
};

type ToastState = {
  queue: ToastItem[];
  push: (item: ToastItem) => void;
  shift: () => void;
};

const useToastStore = create<ToastState>((set) => ({
  queue: [],
  push: (item) => set((s) => ({ queue: [...s.queue, item] })),
  shift: () => set((s) => ({ queue: s.queue.slice(1) })),
}));

export type ShowToastOptions = {
  action?: ToastAction;
  durationMs?: number;
  /** `null` masque l'icône. Défaut : coche de succès (comme la maquette). */
  icon?: IconName | null;
};

let seq = 0;

/** `const { show } = useToast(); show('Adresse enregistrée', { action: { label: 'Annuler', onPress } })`. */
export function useToast() {
  const push = useToastStore((s) => s.push);
  return {
    show: (message: string, options?: ShowToastOptions) => {
      const durationMs = options?.durationMs ?? (options?.action ? 5000 : 4000);
      push({
        id: `t${Date.now()}-${seq++}`,
        message,
        action: options?.action,
        durationMs,
        icon: options?.icon === undefined ? 'check' : options.icon,
      });
    },
  };
}

function ToastCard({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(item.message);
    progress.value = withTiming(1, { duration: motion.duration.base });
    const timer = setTimeout(() => {
      progress.value = withTiming(0, { duration: motion.duration.base }, (finished) => {
        if (finished) runOnJS(onDone)();
      });
    }, item.durationMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 24 }],
  }));

  return (
    <AnimatedView
      style={[style, elevation.e2, { backgroundColor: colors.toastBg }]}
      className="mx-5 flex-row items-center gap-2.5 rounded-2xl px-4 py-3.5"
    >
      {item.icon ? <Icon name={item.icon} size={18} color={colors.toastSuccess} /> : null}
      <Text
        tone="inherit"
        style={{ color: colors.toastText }}
        className="flex-1 font-body-bold text-label"
      >
        {item.message}
      </Text>
      {item.action ? (
        <Pressable
          onPress={() => {
            item.action?.onPress();
            onDone();
          }}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={{ color: colors.toastAction }} className="font-body-extrabold text-label">
            {item.action.label}
          </Text>
        </Pressable>
      ) : null}
    </AnimatedView>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const queue = useToastStore((s) => s.queue);
  const shift = useToastStore((s) => s.shift);
  const insets = useSafeAreaInsets();
  // Pas d'état miroir : shift() retire l'élément affiché de la file dès qu'il est fait,
  // queue[0] désigne donc toujours le toast courant sans effet de bord supplémentaire.
  const current = queue[0] ?? null;

  const handleDone = () => shift();

  return (
    <View className="flex-1">
      {children}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 12 }}
      >
        {current ? <ToastCard key={current.id} item={current} onDone={handleDone} /> : null}
      </View>
    </View>
  );
}
