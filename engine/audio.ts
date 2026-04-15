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
