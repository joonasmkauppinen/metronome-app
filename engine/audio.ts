import { Audio } from 'expo-av';

const POOL_SIZE = 6;

let clickPool: Audio.Sound[] = [];
let accentPool: Audio.Sound[] = [];
let clickIndex = 0;
let accentIndex = 0;

async function createPool(source: Parameters<typeof Audio.Sound.createAsync>[0]): Promise<Audio.Sound[]> {
  const pool: Audio.Sound[] = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    const { sound } = await Audio.Sound.createAsync(source);
    pool.push(sound);
  }
  return pool;
}

export async function initAudio(): Promise<void> {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  [clickPool, accentPool] = await Promise.all([
    createPool(require('@/assets/sounds/click.wav')),
    createPool(require('@/assets/sounds/accent.wav')),
  ]);
  clickIndex = 0;
  accentIndex = 0;
}

export async function playClick(isAccent: boolean): Promise<void> {
  try {
    if (isAccent) {
      const sound = accentPool[accentIndex % POOL_SIZE];
      accentIndex++;
      sound.replayAsync();
    } else {
      const sound = clickPool[clickIndex % POOL_SIZE];
      clickIndex++;
      sound.replayAsync();
    }
  } catch {
    // Ignore: pool slot may still be loading on slow devices
  }
}

export async function unloadAudio(): Promise<void> {
  await Promise.all([
    ...clickPool.map((s) => s.unloadAsync()),
    ...accentPool.map((s) => s.unloadAsync()),
  ]);
  clickPool = [];
  accentPool = [];
  clickIndex = 0;
  accentIndex = 0;
}
