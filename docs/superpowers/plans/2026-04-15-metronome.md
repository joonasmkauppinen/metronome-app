# Metronome App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Expo template with a single-screen minimalist metronome: audible click at 20–300 BPM, beat indicator, tap tempo, full time signature support.

**Architecture:** Single root screen (`app/index.tsx`). Audio engine (`engine/audio.ts`) preloads two WAV files via expo-av at startup. A `setInterval`-based scheduler (`engine/scheduler.ts`) polls every 25ms and fires beats when `Date.now() >= nextBeatTime`, preventing drift by advancing from scheduled time. All state and logic live in `hooks/use-metronome.ts`; components are purely presentational. Animations use react-native-reanimated. Custom gesture-based slider uses react-native-gesture-handler (both already installed).

**Tech Stack:** Expo SDK 54, React Native, TypeScript, react-native-reanimated 4.x, react-native-gesture-handler 2.x, expo-av (new install), jest-expo (new install)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `app/_layout.tsx` | Modify | Minimal Stack, dark background, no tabs |
| `app/index.tsx` | Modify | Main metronome screen, assembles all components |
| `app/(tabs)/` | Delete | Entire directory removed |
| `engine/scheduler.ts` | Create | setInterval beat scheduler, tracks nextBeatTime |
| `engine/audio.ts` | Create | Preloads click/accent sounds, exposes playClick() |
| `engine/__tests__/scheduler.test.ts` | Create | Beat timing and BPM change tests |
| `hooks/use-metronome.ts` | Create | All metronome state: bpm, isPlaying, timeSignature, currentBeat, tapTempo |
| `hooks/__tests__/use-metronome.test.ts` | Create | Tap tempo calculation tests |
| `components/beat-indicator.tsx` | Create | Pulsing Reanimated circle + beat position dots |
| `components/bpm-display.tsx` | Create | Large read-only BPM number |
| `components/bpm-slider.tsx` | Create | Custom gesture-based slider, 20–300 range |
| `components/tap-tempo-button.tsx` | Create | TAP button with opacity flash |
| `components/play-stop-button.tsx` | Create | Large play/stop circle button |
| `components/horizontal-scroll-picker.tsx` | Create | Horizontal FlatList scroll selector, snaps to item |
| `components/time-signature-picker.tsx` | Create | Two HorizontalScrollPickers stacked vertically |
| `scripts/generate-sounds.js` | Create | Node script that writes click.wav and accent.wav |
| `assets/sounds/click.wav` | Generate | 800 Hz 100ms sine decay — regular beat |
| `assets/sounds/accent.wav` | Generate | 1200 Hz 100ms sine decay — beat 1 |
| `package.json` | Modify | Add test script, jest config, expo-av |
| `components/hello-wave.tsx` | Delete | Unused template component |
| `components/parallax-scroll-view.tsx` | Delete | Unused template component |
| `components/external-link.tsx` | Delete | Unused template component |
| `components/haptic-tab.tsx` | Delete | Unused template component |
| `components/collapsible.tsx` | Delete | Unused template component |

---

## Task 1: Remove Tab Structure, Set Up Single-Screen Layout

**Files:**
- Delete: `app/(tabs)/` (whole directory)
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`
- Delete: `components/hello-wave.tsx`, `components/parallax-scroll-view.tsx`, `components/external-link.tsx`, `components/haptic-tab.tsx`, `components/collapsible.tsx`

- [ ] **Step 1: Delete the tabs directory and unused components**

```bash
rm -rf app/\(tabs\)
rm components/hello-wave.tsx components/parallax-scroll-view.tsx components/external-link.tsx components/haptic-tab.tsx components/collapsible.tsx
```

- [ ] **Step 2: Replace `app/_layout.tsx`**

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#151718' } }} />
      <StatusBar style="light" />
    </>
  );
}
```

- [ ] **Step 3: Replace `app/index.tsx` with a stub**

```tsx
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
```

- [ ] **Step 4: Verify app starts without errors**

```bash
npm run ios
```

Expected: Dark screen with "Metronome" text. No red error screen.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove expo template, set up single-screen dark layout"
```

---

## Task 2: Set Up Jest

**Files:**
- Modify: `package.json`
- Create: `engine/__tests__/` and `hooks/__tests__/` directories (via test files)

- [ ] **Step 1: Install test dependencies**

```bash
npx expo install jest-expo @testing-library/react-native @types/jest
```

- [ ] **Step 2: Add test script and Jest config to `package.json`**

Add to the `"scripts"` section:
```json
"test": "jest"
```

Add at the top level (not inside `scripts`):
```json
"jest": {
  "preset": "jest-expo"
}
```

- [ ] **Step 3: Create a smoke test to verify Jest works**

Create `engine/__tests__/smoke.test.ts`:
```ts
describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected output:
```
PASS engine/__tests__/smoke.test.ts
  smoke
    ✓ runs
Tests: 1 passed, 1 total
```

- [ ] **Step 5: Delete the smoke test and commit**

```bash
rm engine/__tests__/smoke.test.ts
git add package.json
git commit -m "chore: add jest-expo test setup"
```

---

## Task 3: Generate Click Sound Assets

**Files:**
- Create: `scripts/generate-sounds.js`
- Create: `assets/sounds/click.wav`
- Create: `assets/sounds/accent.wav`

- [ ] **Step 1: Create `scripts/generate-sounds.js`**

```js
const fs = require('fs');
const path = require('path');

function generateWav(filename, frequencyHz, durationSec, amplitude = 0.8) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8, 'ascii');

  // fmt chunk
  buffer.write('fmt ', 12, 'ascii');
  buffer.writeUInt32LE(16, 16);       // chunk size
  buffer.writeUInt16LE(1, 20);        // PCM format
  buffer.writeUInt16LE(1, 22);        // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate (sampleRate * channels * bitsPerSample/8)
  buffer.writeUInt16LE(2, 32);        // block align
  buffer.writeUInt16LE(16, 34);       // bits per sample

  // data chunk
  buffer.write('data', 36, 'ascii');
  buffer.writeUInt32LE(dataSize, 40);

  // Generate sine wave with exponential decay envelope
  for (let i = 0; i < numSamples; i++) {
    const envelope = Math.exp(-i / (sampleRate * 0.02)); // ~20ms decay
    const sample = Math.sin(2 * Math.PI * frequencyHz * i / sampleRate) * amplitude * envelope;
    const intSample = Math.round(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  const outPath = path.join(__dirname, '..', 'assets', 'sounds', filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated ${outPath}`);
}

const soundsDir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

generateWav('click.wav', 800, 0.08);    // 800 Hz, 80ms — regular beat
generateWav('accent.wav', 1200, 0.08);  // 1200 Hz, 80ms — beat 1 accent
console.log('Done.');
```

- [ ] **Step 2: Run the script**

```bash
node scripts/generate-sounds.js
```

Expected output:
```
Generated .../assets/sounds/click.wav
Generated .../assets/sounds/accent.wav
Done.
```

- [ ] **Step 3: Verify files exist**

```bash
ls -lh assets/sounds/
```

Expected: Two files, each ~14 KB.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-sounds.js assets/sounds/
git commit -m "feat: add click sound generation script and WAV assets"
```

---

## Task 4: Audio Module

**Files:**
- Create: `engine/audio.ts`

- [ ] **Step 1: Install expo-av**

```bash
npx expo install expo-av
```

- [ ] **Step 2: Create `engine/audio.ts`**

```ts
import { Audio } from 'expo-av';

let clickSound: Audio.Sound | null = null;
let accentSound: Audio.Sound | null = null;

export async function initAudio(): Promise<void> {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  const { sound: click } = await Audio.Sound.createAsync(
    require('@/assets/sounds/click.wav')
  );
  const { sound: accent } = await Audio.Sound.createAsync(
    require('@/assets/sounds/accent.wav')
  );
  clickSound = click;
  accentSound = accent;
}

export async function playClick(isAccent: boolean): Promise<void> {
  const sound = isAccent ? accentSound : clickSound;
  if (!sound) return;
  try {
    await sound.replayAsync();
  } catch {
    // Ignore: may fire if called before previous play finishes on slow devices
  }
}

export async function unloadAudio(): Promise<void> {
  await clickSound?.unloadAsync();
  await accentSound?.unloadAsync();
  clickSound = null;
  accentSound = null;
}
```

- [ ] **Step 3: Commit**

```bash
git add engine/audio.ts package.json
git commit -m "feat: add audio module with expo-av sound preloading"
```

---

## Task 5: Scheduler + Tests

**Files:**
- Create: `engine/scheduler.ts`
- Create: `engine/__tests__/scheduler.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `engine/__tests__/scheduler.test.ts`:

```ts
import { Scheduler } from '../scheduler';

describe('Scheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fires beat 0 immediately on start', () => {
    const onBeat = jest.fn();
    const scheduler = new Scheduler(onBeat);
    scheduler.setBpm(120);
    scheduler.setNumerator(4);
    scheduler.start();

    jest.advanceTimersByTime(25);
    expect(onBeat).toHaveBeenCalledTimes(1);
    expect(onBeat).toHaveBeenCalledWith(0);

    scheduler.stop();
  });

  it('fires beats at correct interval for 120 BPM', () => {
    const onBeat = jest.fn();
    const scheduler = new Scheduler(onBeat);
    scheduler.setBpm(120); // 500ms per beat
    scheduler.setNumerator(4);
    scheduler.start();

    jest.advanceTimersByTime(25);   // beat 0 at t=0
    expect(onBeat).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(475);  // total 500ms
    expect(onBeat).toHaveBeenCalledTimes(2);
    expect(onBeat).toHaveBeenNthCalledWith(2, 1);

    scheduler.stop();
  });

  it('cycles beat index through numerator', () => {
    const onBeat = jest.fn();
    const scheduler = new Scheduler(onBeat);
    scheduler.setBpm(120); // 500ms per beat
    scheduler.setNumerator(3);
    scheduler.start();

    jest.advanceTimersByTime(25);   // beat 0
    jest.advanceTimersByTime(500);  // beat 1
    jest.advanceTimersByTime(500);  // beat 2
    jest.advanceTimersByTime(500);  // beat 0 again

    expect(onBeat).toHaveBeenNthCalledWith(1, 0);
    expect(onBeat).toHaveBeenNthCalledWith(2, 1);
    expect(onBeat).toHaveBeenNthCalledWith(3, 2);
    expect(onBeat).toHaveBeenNthCalledWith(4, 0);

    scheduler.stop();
  });

  it('stop() halts beat firing', () => {
    const onBeat = jest.fn();
    const scheduler = new Scheduler(onBeat);
    scheduler.setBpm(120);
    scheduler.setNumerator(4);
    scheduler.start();

    jest.advanceTimersByTime(25); // beat 0
    scheduler.stop();
    jest.advanceTimersByTime(1000);
    expect(onBeat).toHaveBeenCalledTimes(1);
  });

  it('setBpm() takes effect on next beat without restart', () => {
    const onBeat = jest.fn();
    const scheduler = new Scheduler(onBeat);
    scheduler.setBpm(120); // 500ms per beat
    scheduler.setNumerator(4);
    scheduler.start();

    jest.advanceTimersByTime(25);   // beat 0 at t=0
    scheduler.setBpm(60);           // 1000ms per beat now
    jest.advanceTimersByTime(500);  // not yet at new interval
    expect(onBeat).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(500);  // now 1000ms total — beat 1
    expect(onBeat).toHaveBeenCalledTimes(2);

    scheduler.stop();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --testPathPattern=scheduler
```

Expected: `FAIL — Cannot find module '../scheduler'`

- [ ] **Step 3: Create `engine/scheduler.ts`**

```ts
type BeatCallback = (beat: number) => void;

export class Scheduler {
  private bpm = 120;
  private numerator = 4;
  private readonly onBeat: BeatCallback;

  private nextBeatTime = 0;
  private currentBeat = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;

  private readonly TICK_MS = 25;

  constructor(onBeat: BeatCallback) {
    this.onBeat = onBeat;
  }

  start(): void {
    this.nextBeatTime = Date.now();
    this.currentBeat = 0;
    this.timerId = setInterval(() => this.tick(), this.TICK_MS);
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
  }

  setNumerator(numerator: number): void {
    this.numerator = numerator;
    this.currentBeat = 0;
  }

  private tick(): void {
    const now = Date.now();
    if (now < this.nextBeatTime) return;

    // If we've fallen more than 2 beats behind (e.g. app backgrounded), resync
    const beatInterval = 60000 / this.bpm;
    if (now - this.nextBeatTime > beatInterval * 2) {
      this.nextBeatTime = now;
    }

    this.onBeat(this.currentBeat);
    this.currentBeat = (this.currentBeat + 1) % this.numerator;
    // Advance from scheduled time (not now) to prevent drift accumulation
    this.nextBeatTime += beatInterval;
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- --testPathPattern=scheduler
```

Expected:
```
PASS engine/__tests__/scheduler.test.ts
  Scheduler
    ✓ fires beat 0 immediately on start
    ✓ fires beats at correct interval for 120 BPM
    ✓ cycles beat index through numerator
    ✓ stop() halts beat firing
    ✓ setBpm() takes effect on next beat without restart
Tests: 5 passed, 5 total
```

- [ ] **Step 5: Commit**

```bash
git add engine/scheduler.ts engine/__tests__/scheduler.test.ts
git commit -m "feat: add beat scheduler with drift-corrected setInterval timing"
```

---

## Task 6: use-metronome Hook + Tests

**Files:**
- Create: `hooks/use-metronome.ts`
- Create: `hooks/__tests__/use-metronome.test.ts`

- [ ] **Step 1: Write failing tests**

Create `hooks/__tests__/use-metronome.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react-native';
import { useMetronome } from '../use-metronome';

jest.mock('@/engine/scheduler', () => ({
  Scheduler: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    setBpm: jest.fn(),
    setNumerator: jest.fn(),
  })),
}));

jest.mock('@/engine/audio', () => ({
  playClick: jest.fn(),
  initAudio: jest.fn(),
  unloadAudio: jest.fn(),
}));

describe('useMetronome defaults', () => {
  it('starts with bpm=120, not playing, 4/4', () => {
    const { result } = renderHook(() => useMetronome());
    expect(result.current.bpm).toBe(120);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.timeSignature).toEqual({ numerator: 4, denominator: 4 });
  });
});

describe('setBpm', () => {
  it('clamps to min 20', () => {
    const { result } = renderHook(() => useMetronome());
    act(() => { result.current.setBpm(5); });
    expect(result.current.bpm).toBe(20);
  });

  it('clamps to max 300', () => {
    const { result } = renderHook(() => useMetronome());
    act(() => { result.current.setBpm(999); });
    expect(result.current.bpm).toBe(300);
  });

  it('sets value within range', () => {
    const { result } = renderHook(() => useMetronome());
    act(() => { result.current.setBpm(180); });
    expect(result.current.bpm).toBe(180);
  });
});

describe('tapTempo', () => {
  let now = 0;

  beforeEach(() => {
    now = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not update BPM after single tap', () => {
    const { result } = renderHook(() => useMetronome());
    act(() => { result.current.tapTempo(); });
    expect(result.current.bpm).toBe(120);
  });

  it('calculates BPM from two taps at 500ms interval → 120 BPM', () => {
    const { result } = renderHook(() => useMetronome());
    act(() => { now = 0; result.current.tapTempo(); });
    act(() => { now = 500; result.current.tapTempo(); });
    expect(result.current.bpm).toBe(120);
  });

  it('averages last 4 tap intervals', () => {
    const { result } = renderHook(() => useMetronome());
    act(() => { now = 0;    result.current.tapTempo(); });
    act(() => { now = 600;  result.current.tapTempo(); }); // 600ms
    act(() => { now = 1200; result.current.tapTempo(); }); // 600ms
    act(() => { now = 1750; result.current.tapTempo(); }); // 550ms — avg ~583ms ≈ 103 BPM
    expect(result.current.bpm).toBe(Math.round(60000 / ((600 + 600 + 550) / 3)));
  });

  it('resets tap sequence after 3 second gap', () => {
    const { result } = renderHook(() => useMetronome());
    act(() => { now = 0;    result.current.tapTempo(); });
    act(() => { now = 500;  result.current.tapTempo(); }); // 120 BPM
    act(() => { now = 4000; result.current.tapTempo(); }); // gap > 3s → reset
    act(() => { now = 4750; result.current.tapTempo(); }); // 750ms → 80 BPM
    expect(result.current.bpm).toBe(80);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --testPathPattern=use-metronome
```

Expected: `FAIL — Cannot find module '../use-metronome'`

- [ ] **Step 3: Create `hooks/use-metronome.ts`**

```ts
import { useState, useEffect, useRef } from 'react';
import { Scheduler } from '@/engine/scheduler';
import { playClick } from '@/engine/audio';

export interface TimeSignature {
  numerator: number;
  denominator: 2 | 4 | 8;
}

export interface MetronomeState {
  bpm: number;
  setBpm: (n: number) => void;
  isPlaying: boolean;
  toggle: () => void;
  timeSignature: TimeSignature;
  setTimeSignature: (ts: TimeSignature) => void;
  currentBeat: number;
  tapTempo: () => void;
}

const TAP_RESET_MS = 3000;
const MAX_TAPS = 4;

export function useMetronome(): MetronomeState {
  const [bpm, setBpmState] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSignature, setTimeSignatureState] = useState<TimeSignature>({
    numerator: 4,
    denominator: 4,
  });
  const [currentBeat, setCurrentBeat] = useState(0);

  const schedulerRef = useRef<Scheduler | null>(null);
  const tapTimestamps = useRef<number[]>([]);

  useEffect(() => {
    schedulerRef.current = new Scheduler((beat) => {
      setCurrentBeat(beat);
      playClick(beat === 0);
    });
    return () => schedulerRef.current?.stop();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      schedulerRef.current?.start();
    } else {
      schedulerRef.current?.stop();
      setCurrentBeat(0);
    }
  }, [isPlaying]);

  useEffect(() => {
    schedulerRef.current?.setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    schedulerRef.current?.setNumerator(timeSignature.numerator);
  }, [timeSignature.numerator]);

  function setBpm(n: number): void {
    setBpmState(Math.max(20, Math.min(300, Math.round(n))));
  }

  function toggle(): void {
    setIsPlaying((p) => !p);
  }

  function setTimeSignature(ts: TimeSignature): void {
    setTimeSignatureState(ts);
  }

  function tapTempo(): void {
    const now = Date.now();
    const timestamps = tapTimestamps.current;

    if (timestamps.length > 0 && now - timestamps[timestamps.length - 1] > TAP_RESET_MS) {
      tapTimestamps.current = [now];
      return;
    }

    const updated = [...timestamps, now].slice(-MAX_TAPS);
    tapTimestamps.current = updated;

    if (updated.length < 2) return;

    let totalInterval = 0;
    for (let i = 1; i < updated.length; i++) {
      totalInterval += updated[i] - updated[i - 1];
    }
    const avgInterval = totalInterval / (updated.length - 1);
    setBpm(Math.round(60000 / avgInterval));
  }

  return { bpm, setBpm, isPlaying, toggle, timeSignature, setTimeSignature, currentBeat, tapTempo };
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- --testPathPattern=use-metronome
```

Expected:
```
PASS hooks/__tests__/use-metronome.test.ts
  useMetronome defaults
    ✓ starts with bpm=120, not playing, 4/4
  setBpm
    ✓ clamps to min 20
    ✓ clamps to max 300
    ✓ sets value within range
  tapTempo
    ✓ does not update BPM after single tap
    ✓ calculates BPM from two taps at 500ms interval → 120 BPM
    ✓ averages last 4 tap intervals
    ✓ resets tap sequence after 3 second gap
Tests: 8 passed, 8 total
```

- [ ] **Step 5: Commit**

```bash
git add hooks/use-metronome.ts hooks/__tests__/use-metronome.test.ts
git commit -m "feat: add use-metronome hook with tap tempo and BPM clamping"
```

---

## Task 7: HorizontalScrollPicker Component

**Files:**
- Create: `components/horizontal-scroll-picker.tsx`

- [ ] **Step 1: Create `components/horizontal-scroll-picker.tsx`**

```tsx
import { useRef, useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Colors } from '@/constants/theme';

const ITEM_WIDTH = 56;

interface Props<T> {
  values: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  label?: string;
}

export function HorizontalScrollPicker<T>({ values, selectedIndex, onSelect, label }: Props<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const padding = containerWidth > 0 ? (containerWidth - ITEM_WIDTH) / 2 : 0;

  useEffect(() => {
    if (containerWidth > 0) {
      scrollRef.current?.scrollTo({ x: selectedIndex * ITEM_WIDTH, animated: true });
    }
  }, [selectedIndex, containerWidth]);

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.max(0, Math.min(values.length - 1, Math.round(offsetX / ITEM_WIDTH)));
    onSelect(index);
  }

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={styles.container}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: padding }}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
        >
          {values.map((value, index) => (
            <Pressable
              key={index}
              style={styles.item}
              onPress={() => onSelect(index)}
            >
              <Text style={[styles.itemText, index === selectedIndex && styles.itemTextSelected]}>
                {String(value)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {/* Center indicator line */}
        <View style={styles.centerLine} pointerEvents="none" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  label: {
    color: Colors.dark.icon,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  container: {
    height: 44,
    width: '100%',
    justifyContent: 'center',
  },
  item: {
    width: ITEM_WIDTH,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    color: Colors.dark.icon,
    fontSize: 20,
    fontWeight: '300',
  },
  itemTextSelected: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: '600',
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    marginLeft: -ITEM_WIDTH / 2,
    width: ITEM_WIDTH,
    height: 44,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.dark.icon + '40',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/horizontal-scroll-picker.tsx
git commit -m "feat: add horizontal scroll picker component"
```

---

## Task 8: TimeSignaturePicker Component

**Files:**
- Create: `components/time-signature-picker.tsx`

- [ ] **Step 1: Create `components/time-signature-picker.tsx`**

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { HorizontalScrollPicker } from '@/components/horizontal-scroll-picker';
import type { TimeSignature } from '@/hooks/use-metronome';
import { Colors } from '@/constants/theme';

const NUMERATORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const DENOMINATORS: (2 | 4 | 8)[] = [2, 4, 8];

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

  function handleDenominatorSelect(index: number) {
    onChange({ ...timeSignature, denominator: DENOMINATORS[index] });
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
        onSelect={handleDenominatorSelect}
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
```

- [ ] **Step 2: Commit**

```bash
git add components/time-signature-picker.tsx
git commit -m "feat: add time signature picker (stacked horizontal scroll pickers)"
```

---

## Task 9: BeatIndicator Component

**Files:**
- Create: `components/beat-indicator.tsx`

- [ ] **Step 1: Create `components/beat-indicator.tsx`**

```tsx
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const CIRCLE_SIZE = 120;
const DOT_SIZE = 8;
const MAX_DOTS = 12;

interface Props {
  currentBeat: number;
  numerator: number;
  isPlaying: boolean;
}

export function BeatIndicator({ currentBeat, numerator, isPlaying }: Props) {
  const scale = useSharedValue(1);
  const isAccent = useSharedValue(false);

  useEffect(() => {
    if (!isPlaying) {
      scale.value = withSpring(1);
      isAccent.value = false;
      return;
    }
    isAccent.value = currentBeat === 0;
    scale.value = withSpring(1.25, { damping: 6, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });
  }, [currentBeat, isPlaying]);

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
              i === currentBeat && isPlaying && styles.dotActive,
              i === 0 && styles.dotAccent,
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
```

- [ ] **Step 2: Commit**

```bash
git add components/beat-indicator.tsx
git commit -m "feat: add beat indicator with Reanimated pulse and beat dots"
```

---

## Task 10: BpmDisplay Component

**Files:**
- Create: `components/bpm-display.tsx`

- [ ] **Step 1: Create `components/bpm-display.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/bpm-display.tsx
git commit -m "feat: add BPM display component"
```

---

## Task 11: BpmSlider Component

**Files:**
- Create: `components/bpm-slider.tsx`

- [ ] **Step 1: Create `components/bpm-slider.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/bpm-slider.tsx
git commit -m "feat: add custom gesture-based BPM slider"
```

---

## Task 12: TapTempoButton Component

**Files:**
- Create: `components/tap-tempo-button.tsx`

- [ ] **Step 1: Create `components/tap-tempo-button.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/tap-tempo-button.tsx
git commit -m "feat: add tap tempo button with opacity flash feedback"
```

---

## Task 13: PlayStopButton Component

**Files:**
- Create: `components/play-stop-button.tsx`

- [ ] **Step 1: Create `components/play-stop-button.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/play-stop-button.tsx
git commit -m "feat: add play/stop button component"
```

---

## Task 14: Assemble Main Screen

**Files:**
- Modify: `app/index.tsx`

- [ ] **Step 1: Replace `app/index.tsx` with full metronome screen**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/index.tsx
git commit -m "feat: assemble metronome main screen"
```

---

## Task 15: Manual Smoke Test on iOS Simulator

- [ ] **Step 1: Start the app**

```bash
npm run ios
```

- [ ] **Step 2: Verify beat indicator animates**

Press play. The circle should pulse on each beat. Beat 1 (first pulse after pressing play) should be white (tint color); subsequent beats should be gray.

- [ ] **Step 3: Verify audible click**

Ensure device/simulator volume is up. You should hear a click on each beat. Beat 1 should sound slightly different (higher pitch) from other beats.

- [ ] **Step 4: Verify BPM slider**

Drag the slider left and right while playing. Beats should speed up/slow down immediately with no restart.

- [ ] **Step 5: Verify tap tempo**

Stop the metronome. Tap the TAP button 4 times at a steady rhythm. The BPM number should update after the second tap and refine with subsequent taps.

- [ ] **Step 6: Verify time signature**

Scroll the numerator picker to 3. Play. After 3 beats, the cycle should restart (beat indicator dots show 3 dots, accent fires every 3 beats).

- [ ] **Step 7: Verify extreme BPM**

Set slider to minimum (~20 BPM). Play. Beats should fire every ~3 seconds. Set to maximum (~300 BPM). Beats should fire 5× per second with no skipping.

- [ ] **Step 8: Fix any issues found and commit**

```bash
git add -A
git commit -m "fix: smoke test corrections"
```

---

## All Tests

Run the full test suite at any time:

```bash
npm test
```

Expected: All tests in `engine/__tests__/` and `hooks/__tests__/` pass.
