import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

interface Props {
  onTap: () => void;
}

export function TapTempoButton({ onTap }: Props) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  function handlePress() {
    opacity.value = withTiming(0.3, { duration: 60 }, () => {
      opacity.value = withTiming(1, { duration: 120 });
    });
    onTap();
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.label}>TAP</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.icon + '60',
    alignItems: 'center',
  },
  label: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 2,
  },
});
