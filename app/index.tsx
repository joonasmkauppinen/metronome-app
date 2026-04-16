import { BeatIndicator } from '@/components/beat-indicator';
import { BpmDisplay } from '@/components/bpm-display';
import { BpmSlider } from '@/components/bpm-slider';
import { PlayStopButton } from '@/components/play-stop-button';
import { TimeSignaturePicker } from '@/components/time-signature-picker';
import { Colors } from '@/constants/theme';
import { initAudio, unloadAudio } from '@/engine/audio';
import { useMetronome } from '@/hooks/use-metronome';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MetronomeScreen() {
  const { bpm, setBpm, isPlaying, toggle, timeSignature, setTimeSignature, currentBeat, beatPulse } =
    useMetronome();

  useEffect(() => {
    initAudio();
    return () => { unloadAudio(); };
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {/* Beat indicator */}
          <View style={styles.section}>
            <BeatIndicator
              currentBeat={currentBeat}
              beatPulse={beatPulse}
              numerator={timeSignature.numerator}
              isPlaying={isPlaying}
            />
          </View>

          {/* BPM display */}
          <View style={styles.section}>
            <BpmDisplay bpm={bpm} />
          </View>

          {/* BPM slider */}
          <View style={[styles.section, styles.sliderSection]}>
            <BpmSlider bpm={bpm} onBpmChange={setBpm} />
          </View>

          {/* Time signature */}
          <View style={[styles.section]}>
            <Text style={styles.label}>Time signature</Text>
            <TimeSignaturePicker timeSignature={timeSignature} onChange={setTimeSignature} />
          </View>

          {/* Play/Stop */}
          <View style={[styles.section, styles.playSection]}>
            <PlayStopButton isPlaying={isPlaying} onToggle={toggle} />
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  section: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderSection: {
    width: '100%',
    alignItems: 'stretch',
  },
  playSection: {
    paddingBottom: 8,
  },
  label: {
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
  },
});
