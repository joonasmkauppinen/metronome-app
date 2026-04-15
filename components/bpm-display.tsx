import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

interface Props {
  bpm: number;
}

export function BpmDisplay({ bpm }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.number}>{bpm}</Text>
      <Text style={styles.label}>BPM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  number: {
    fontFamily: Fonts?.mono ?? 'monospace',
    fontSize: 72,
    fontWeight: '200',
    color: Colors.dark.text,
    lineHeight: 80,
    minWidth: 120,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
  },
});
