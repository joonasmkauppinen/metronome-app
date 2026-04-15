# Metronome App — Design Spec

_Date: 2026-04-15_

---

## Overview

Simple, minimalistic metronome app built with Expo (SDK 54) + React Native + TypeScript. Targets iOS primarily, Android secondarily. Dark theme only. Single-screen UI.

---

## Features

1. Adjust tempo (BPM) via slider and tap tempo
2. Audible click at selected BPM (accent on beat 1)
3. Beat indicator (pulsing circle, animates on each beat)
4. Full time signature support (numerator 1–12, denominator 2/4/8)
5. BPM changes take effect immediately while playing
6. BPM range: 20–300

---

## Architecture

### Screen Structure

Single screen. No tabs. Replace Expo template tabs with one root screen.

```
app/
  _layout.tsx                    # Minimal Stack layout, dark background
  index.tsx                      # Root metronome screen

components/
  beat-indicator.tsx             # Pulsing circle, Reanimated animation
  bpm-display.tsx                # Large read-only BPM number
  bpm-slider.tsx                 # Horizontal slider, range 20–300
  tap-tempo-button.tsx           # TAP button, calculates BPM from taps
  play-stop-button.tsx           # Large play/stop toggle
  time-signature-picker.tsx      # Two stacked horizontal scroll inputs (numerator / denominator)
  horizontal-scroll-picker.tsx  # Reusable horizontal scroll selector component

hooks/
  use-metronome.ts               # All metronome state and logic

engine/
  scheduler.ts                   # Lookahead beat scheduler
  audio.ts                       # Sound preloader and player

assets/sounds/
  click.wav                      # Regular beat sound
  accent.wav                     # Beat 1 accent sound (higher pitch / louder)
```

### UI Layout (top to bottom, vertical stack)

1. Beat indicator — center, prominent
2. BPM display — large monospaced number
3. BPM slider
4. Tap tempo button
5. Time signature picker
6. Play/Stop button — large, bottom of screen

---

## Audio Engine

### Sound Files

Two WAV files bundled in `assets/sounds/`:
- `click.wav` — regular beat
- `accent.wav` — beat 1 (higher pitch or louder)

### Scheduler (`engine/scheduler.ts`)

Lookahead JS scheduler — proven technique for accurate audio timing in browser/RN environments.

- `setInterval` fires every **25ms**
- On each tick: checks if any beats fall within the next **100ms** lookahead window
- Schedules those beats by calling `audio.playClick(isAccent)`
- Tracks `nextBeatTime` as an absolute timestamp (ms)
- Advances `nextBeatTime` by `60000 / bpm` per beat
- Tracks `currentBeat` (0-indexed, resets at `numerator`) — beat 0 is the accent
- BPM change mid-play: update interval math immediately, do **not** reset `nextBeatTime` (avoids skip or double-hit)
- Calls a `onBeat(beatIndex)` callback on each scheduled beat so React state can update the beat indicator

#### Timing at extremes

| BPM | Interval | Lookahead windows per beat |
|-----|----------|---------------------------|
| 20  | 3000ms   | ~120 (scheduler mostly idle) |
| 300 | 200ms    | ~8 (schedules cleanly ahead) |

### Audio (`engine/audio.ts`)

- Preloads both sounds at app start via `expo-audio`
- Keeps `Sound` objects in memory — no reload per beat
- Exposes `playClick(isAccent: boolean)`

---

## State & Data Flow

### `use-metronome` hook

Owns all metronome state and logic. Components are pure UI — no logic in components.

**State:**

```ts
bpm: number                              // 20–300, default 120
isPlaying: boolean                       // default false
timeSignature: {
  numerator: number                      // 1–12, default 4
  denominator: 2 | 4 | 8               // default 4
}
currentBeat: number                      // 0-indexed, drives beat indicator highlight
```

**Exposed API:**

```ts
bpm
setBpm(n: number): void
isPlaying
toggle(): void                           // start/stop
timeSignature
setTimeSignature(ts: { numerator: number; denominator: 2 | 4 | 8 }): void
currentBeat
tapTempo(): void                         // call on each tap
```

### Tap Tempo Logic

- Store timestamps of last 4 taps
- BPM = average of intervals between consecutive taps, converted to BPM
- Minimum 2 taps required before BPM updates
- Gap > 3 seconds between taps: reset tap sequence

### BPM Change While Playing

`setBpm` updates React state and immediately passes new BPM to the scheduler. Scheduler recalculates the next beat interval without restarting. No audible gap or double-hit.

### Beat Indicator Update

Scheduler calls `onBeat(beatIndex)` callback → updates `currentBeat` in React state → `beat-indicator.tsx` receives new value → triggers Reanimated animation.

---

## UI Details

### Beat Indicator

- Pulsing circle using Reanimated (`withSpring` or `withTiming`)
- On each beat: scale up briefly, return to rest size
- Beat 0 (accent): accent color (tint from color palette)
- Other beats: muted color (icon color from palette)
- Shows current beat position within bar (e.g. dots or numbered segments around the circle)

### BPM Display

- Large monospaced number (e.g. `128`)
- Read-only — reflects slider and tap tempo state
- Updates live as slider drags or taps register

### BPM Slider

- Horizontal, range 20–300
- Live update: BPM changes immediately as user drags
- Works while playing — scheduler picks up new BPM without restart

### Tap Tempo Button

- Label: `TAP`
- Each press calls `tapTempo()`
- Brief opacity flash on press for tactile feedback
- Requires 2+ taps before BPM updates

### Time Signature Picker

- Two custom horizontal scroll inputs stacked vertically (numerator on top, denominator below)
- Each row: swipe/scroll left-right to cycle through values
  - Numerator: 1–12
  - Denominator: 2, 4, 8
- Selected value centered and highlighted; adjacent values visible and dimmed
- Change takes effect immediately: beat counter resets to 0 on change

### Play/Stop Button

- Large circle, bottom of screen
- Play ▶ icon when stopped, Stop ■ icon when playing
- Accent color when playing

---

## Theming

Dark theme only. No light/dark switching. Use `Colors.dark` from `constants/theme.ts` directly — no `useThemeColor` hook needed. Keeps components simple.

Color roles:
- `background`: `#151718` — screen background
- `text`: `#ECEDEE` — labels, BPM number
- `tint`: `#fff` — accent beat, play button active state
- `icon`: `#9BA1A6` — regular beats, inactive UI elements

---

## Dependencies

Already installed:
- `react-native-reanimated` — beat indicator animation
- `expo-haptics` — optional haptic pulse on beat (enhancement, not required for MVP)

New dependencies needed:
- `expo-audio` — sound playback (`expo-av` successor, not yet in package.json)

---

## Out of Scope (MVP)

- Light theme
- Web platform support
- Subdivision beats (eighth notes, triplets)
- Tempo markings (Allegro, Andante, etc.)
- Save/load presets
- Background audio playback (screen-off)
