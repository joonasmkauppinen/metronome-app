# Metronome app

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

<div align="center">
  <img width="500" alt="Screenshot 2026-04-17 at 12 53 08" src="https://github.com/user-attachments/assets/e77cde68-c053-46a8-99bc-78e229a8ba15" />
</div>

## Run project

0. Clone the repo

   ```bash
   git clone git@github.com:joonasmkauppinen/metronome-app.git

   cd metronome-app
   ```

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   For Expo Go:

   ```bash
   npm start
   ```

   iOS simulator:

   ```bash
   npm run ios
   ```

## Design decisions

Goal was to leverage agentic coding as much as possible to build the app. Claude Code with superpowers:brainstorming was used to generate the implementation plan. The full plan specification can be found [here](docs/superpowers/plans/2026-04-15-metronome.md).

In short:
- The metronome functionality is built with `expo-av` and `setInterval`-based scheduler.
- There is support for basic time signatures, but no support for accents or more complex time signatures
- The app accents the first beat of each measure by using a different sound for it, and also visually indicates the current beat with an animated circle.

## Known limitations

- The scheduler is not very accurate, especially at higher BPMs. It's ok up to 244 bpm, but above that the timing starts to drift severely. There are also smaller noticeable inconsistencies at lower BPMs, but they are not as severe.
- Only a simple time signature scale is implemented, with no support for more complex time signatures or accents.

## Improvements

- Don't use `expo-av`, instead use a more accurate audio library or native code for better timing accuracy. `react-native-audio-api` is one library worth exploring.
- Implement a more robust scheduling algorithm that can handle timing better.