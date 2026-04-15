import { View, Text, StyleSheet } from 'react-native';

export default function MetronomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Metronome</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#151718', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#ECEDEE', fontSize: 24 },
});
