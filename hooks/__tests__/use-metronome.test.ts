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
