/**
 * Double curseur de fourchette — design/Filters.dc.html « Prix estimé » (piste 4px,
 * poignées 26px, segment actif pétrole). Aucune lib de double-poignée dans la liste
 * CLAUDE.md autorisée : construit avec react-native-gesture-handler + reanimated, comme
 * les autres composants interactifs (Switch, Segmented).
 */
import { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { AnimatedView } from '@/lib/animated';

const HANDLE_SIZE = 26;
const MIN_GAP_PX = HANDLE_SIZE;

export type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  minimumLabel?: string;
  maximumLabel?: string;
  testID?: string;
};

export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  minimumLabel = 'Prix minimum',
  maximumLabel = 'Prix maximum',
  testID,
}: RangeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const usableWidth = Math.max(trackWidth - HANDLE_SIZE, 1);

  const valueToPx = useCallback(
    (v: number) => ((v - min) / (max - min)) * usableWidth,
    [min, max, usableWidth],
  );
  const pxToValue = useCallback(
    (px: number) => {
      const raw = min + (px / usableWidth) * (max - min);
      return Math.round(raw / step) * step;
    },
    [min, max, step, usableWidth],
  );

  const minPx = useSharedValue(valueToPx(value[0]));
  const maxPx = useSharedValue(valueToPx(value[1]));
  const minPxStart = useSharedValue(0);
  const maxPxStart = useSharedValue(0);

  const emitChange = useCallback(
    (minV: number, maxV: number) => onChange([minV, maxV]),
    [onChange],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTrackWidth(w);
    const usable = Math.max(w - HANDLE_SIZE, 1);
    minPx.value = ((value[0] - min) / (max - min)) * usable;
    maxPx.value = ((value[1] - min) / (max - min)) * usable;
  };

  const minGesture = Gesture.Pan()
    .onBegin(() => {
      minPxStart.value = minPx.value;
    })
    .onUpdate((e) => {
      const next = Math.min(
        Math.max(minPxStart.value + e.translationX, 0),
        maxPx.value - MIN_GAP_PX,
      );
      minPx.value = next;
      runOnJS(emitChange)(pxToValue(next), pxToValue(maxPx.value));
    });

  const maxGesture = Gesture.Pan()
    .onBegin(() => {
      maxPxStart.value = maxPx.value;
    })
    .onUpdate((e) => {
      const next = Math.max(
        Math.min(maxPxStart.value + e.translationX, usableWidth),
        minPx.value + MIN_GAP_PX,
      );
      maxPx.value = next;
      runOnJS(emitChange)(pxToValue(minPx.value), pxToValue(next));
    });

  const minHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: minPx.value }],
  }));
  const maxHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: maxPx.value }],
  }));
  const activeTrackStyle = useAnimatedStyle(() => ({
    left: minPx.value + HANDLE_SIZE / 2,
    right: usableWidth - maxPx.value + HANDLE_SIZE / 2,
  }));

  // Garde la position visuelle synchronisée si `value` change depuis l'extérieur
  // (ex. réinitialisation des filtres) sans que l'utilisateur ait bougé un curseur.
  useEffect(() => {
    if (trackWidth === 0) return;
    minPx.value = valueToPx(value[0]);
    maxPx.value = valueToPx(value[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- minPx/maxPx sont des shared values stables
  }, [value[0], value[1], trackWidth]);

  return (
    <View testID={testID} onLayout={onLayout} className="h-11 justify-center">
      <View className="absolute left-0 right-0 h-1 rounded-full bg-border" />
      <AnimatedView style={activeTrackStyle} className="absolute h-1 rounded-full bg-primary" />

      <GestureDetector gesture={minGesture}>
        <AnimatedView
          style={minHandleStyle}
          accessibilityRole="adjustable"
          accessibilityLabel={minimumLabel}
          accessibilityValue={{ min, max, now: value[0] }}
          className="absolute left-0 top-[9px] h-[26px] w-[26px] rounded-full border-2 border-primary bg-surface shadow-sm"
        />
      </GestureDetector>
      <GestureDetector gesture={maxGesture}>
        <AnimatedView
          style={maxHandleStyle}
          accessibilityRole="adjustable"
          accessibilityLabel={maximumLabel}
          accessibilityValue={{ min, max, now: value[1] }}
          className="absolute left-0 top-[9px] h-[26px] w-[26px] rounded-full border-2 border-primary bg-surface shadow-sm"
        />
      </GestureDetector>
    </View>
  );
}
