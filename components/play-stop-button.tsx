import { Pressable, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface Props {
  isPlaying: boolean;
  onToggle: () => void;
}

export function PlayStopButton({ isPlaying, onToggle }: Props) {
  return (
    <Pressable
      style={[styles.button, isPlaying && styles.buttonActive]}
      onPress={onToggle}
    >
      {isPlaying ? <StopIcon /> : <PlayIcon />}
    </Pressable>
  );
}

function PlayIcon() {
  // Triangle pointing right
  return (
    <View style={styles.playIcon} />
  );
}

function StopIcon() {
  return <View style={styles.stopIcon} />;
}

const BUTTON_SIZE = 72;
const PLAY_ICON_SIZE = 24;

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.dark.icon + '30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.icon,
  },
  buttonActive: {
    borderColor: Colors.dark.tint,
    backgroundColor: Colors.dark.tint + '20',
  },
  playIcon: {
    width: 0,
    height: 0,
    borderTopWidth: PLAY_ICON_SIZE / 2,
    borderBottomWidth: PLAY_ICON_SIZE / 2,
    borderLeftWidth: PLAY_ICON_SIZE,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Colors.dark.text,
    marginLeft: 4, // optical center
  },
  stopIcon: {
    width: PLAY_ICON_SIZE * 0.7,
    height: PLAY_ICON_SIZE * 0.7,
    backgroundColor: Colors.dark.text,
    borderRadius: 2,
  },
});
