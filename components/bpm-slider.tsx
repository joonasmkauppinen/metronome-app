import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const THUMB_RADIUS = 14;
const TRACK_HEIGHT = 3;

interface Props {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  min?: number;
  max?: number;
}

export function BpmSlider({ bpm, onBpmChange, min = 20, max = 300 }: Props) {
  const trackWidth = useSharedValue(0);
  const thumbX = useSharedValue(0); // left edge of thumb, 0 → trackWidth - THUMB_RADIUS*2
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Sync thumb from bpm prop when not dragging
  useEffect(() => {
    if (!isDragging.value && trackWidth.value > 0) {
      const maxX = trackWidth.value - THUMB_RADIUS * 2;
      thumbX.value = ((bpm - min) / (max - min)) * maxX;
    }
  }, [bpm, min, max]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      startX.value = thumbX.value;
    })
    .onUpdate((e) => {
      const maxX = trackWidth.value - THUMB_RADIUS * 2;
      const newX = Math.max(0, Math.min(maxX, startX.value + e.translationX));
      thumbX.value = newX;
      const ratio = maxX > 0 ? newX / maxX : 0;
      const newBpm = Math.round(min + ratio * (max - min));
      runOnJS(onBpmChange)(newBpm);
    })
    .onEnd(() => {
      isDragging.value = false;
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value + THUMB_RADIUS,
  }));

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        trackWidth.value = width;
        const maxX = width - THUMB_RADIUS * 2;
        thumbX.value = ((bpm - min) / (max - min)) * maxX;
      }}
    >
      {/* Track */}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      {/* Thumb */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: THUMB_RADIUS * 2,
    position: 'relative',
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: THUMB_RADIUS,
    right: THUMB_RADIUS,
    height: TRACK_HEIGHT,
    backgroundColor: Colors.dark.icon + '40',
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  fill: {
    height: TRACK_HEIGHT,
    backgroundColor: Colors.dark.tint,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_RADIUS * 2,
    height: THUMB_RADIUS * 2,
    borderRadius: THUMB_RADIUS,
    backgroundColor: Colors.dark.tint,
    top: 0,
  },
});
