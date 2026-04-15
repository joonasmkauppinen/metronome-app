import { Colors } from '@/constants/theme';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const CIRCLE_SIZE = 120;
const DOT_SIZE = 8;
const MAX_DOTS = 12;

interface Props {
  currentBeat: number;
  beatPulse: number;
  numerator: number;
  isPlaying: boolean;
}

export function BeatIndicator({ currentBeat, beatPulse, numerator, isPlaying }: Props) {
  const scale = useSharedValue(1);
  const isAccent = useSharedValue(false);

  useEffect(() => {
    if (!isPlaying) {
      scale.value = withTiming(1, { duration: 300, easing: Easing.ease });
      isAccent.value = false;
      return;
    }

    isAccent.value = currentBeat === 0;

    scale.value = withTiming(1.15, { duration: 50, }, () => {
      scale.value = withTiming(1, { duration: 300, easing: Easing.ease });
    });
  }, [beatPulse, currentBeat, isAccent, isPlaying, scale]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: isAccent.value ? Colors.dark.tint : Colors.dark.icon,
  }));

  const visibleDots = Math.min(numerator, MAX_DOTS);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, circleStyle]} />
      <View style={styles.dots}>
        {Array.from({ length: visibleDots }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === 0 && styles.dotAccent,
              i === currentBeat && isPlaying && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: Colors.dark.icon,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: (DOT_SIZE + 8) * MAX_DOTS,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.dark.icon + '60',
  },
  dotActive: {
    backgroundColor: Colors.dark.tint,
  },
  dotAccent: {
    backgroundColor: Colors.dark.icon,
  },
});
