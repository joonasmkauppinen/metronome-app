import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initAudio, unloadAudio } from '@/engine/audio';
import { useMetronome } from '@/hooks/use-metronome';
import { BeatIndicator } from '@/components/beat-indicator';
import { BpmDisplay } from '@/components/bpm-display';
import { BpmSlider } from '@/components/bpm-slider';
import { TapTempoButton } from '@/components/tap-tempo-button';
import { PlayStopButton } from '@/components/play-stop-button';
import { TimeSignaturePicker } from '@/components/time-signature-picker';
import { Colors } from '@/constants/theme';

export default function MetronomeScreen() {
  const { bpm, setBpm, isPlaying, toggle, timeSignature, setTimeSignature, currentBeat, tapTempo } =
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

          {/* Tap tempo */}
          <View style={styles.section}>
            <TapTempoButton onTap={tapTempo} />
          </View>

          {/* Time signature */}
          <View style={[styles.section, styles.sliderSection]}>
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
  },
  sliderSection: {
    width: '100%',
    alignItems: 'stretch',
  },
  playSection: {
    paddingBottom: 8,
  },
});
