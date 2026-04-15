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
