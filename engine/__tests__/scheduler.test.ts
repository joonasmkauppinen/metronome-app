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
