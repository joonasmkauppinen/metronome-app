import { playClick } from '@/engine/audio';
import { Scheduler } from '@/engine/scheduler';
import { useEffect, useRef, useState } from 'react';

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
  beatPulse: number;
}

export function useMetronome(): MetronomeState {
  const [bpm, setBpmState] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSignature, setTimeSignatureState] = useState<TimeSignature>({
    numerator: 4,
    denominator: 4,
  });
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatPulse, setBeatPulse] = useState(0);

  const schedulerRef = useRef<Scheduler | null>(null);

  useEffect(() => {
    schedulerRef.current = new Scheduler((beat) => {
      setCurrentBeat(beat);
      setBeatPulse((p) => p + 1);
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

  return { bpm, setBpm, isPlaying, toggle, timeSignature, setTimeSignature, currentBeat, beatPulse };
}
