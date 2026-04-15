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
    if (this.timerId !== null) {
      // Recalculate nextBeatTime based on when the last beat was fired
      const oldBeatInterval = 60000 / this.bpm;
      const newBeatInterval = 60000 / bpm;
      const lastBeatTime = this.nextBeatTime - oldBeatInterval;
      this.nextBeatTime = lastBeatTime + newBeatInterval;
    }
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
