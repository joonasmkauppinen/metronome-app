import { HorizontalScrollPicker } from '@/components/horizontal-scroll-picker';
import { Colors } from '@/constants/theme';
import type { TimeSignature } from '@/hooks/use-metronome';
import { StyleSheet, Text, View } from 'react-native';

const NUMERATORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const DENOMINATORS = [4];

interface Props {
  timeSignature: TimeSignature;
  onChange: (ts: TimeSignature) => void;
}

export function TimeSignaturePicker({ timeSignature, onChange }: Props) {
  const numeratorIndex = NUMERATORS.indexOf(timeSignature.numerator);
  const denominatorIndex = DENOMINATORS.indexOf(timeSignature.denominator);

  function handleNumeratorSelect(index: number) {
    onChange({ ...timeSignature, numerator: NUMERATORS[index] });
  }

  return (
    <View style={styles.container}>
      <HorizontalScrollPicker
        values={NUMERATORS}
        selectedIndex={numeratorIndex}
        onSelect={handleNumeratorSelect}
      />
      <Text style={styles.divider}>—</Text>
      <HorizontalScrollPicker
        values={DENOMINATORS}
        selectedIndex={denominatorIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 4,
  },
  divider: {
    color: Colors.dark.icon,
    textAlign: 'center',
    fontSize: 16,
  },
});
