# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React Native metronome app built with Expo (SDK 54) and TypeScript. Targets iOS, Android, and web.

## Commands

```bash
npm start           # Start Expo dev server (opens QR code / press i/a/w)
npm run ios         # Open in iOS simulator
npm run android     # Open in Android emulator
npm run web         # Open in browser
npm run lint        # Run ESLint via expo lint
```

No test framework is configured yet.

## Architecture

### Routing

Uses **expo-router** (file-based routing). All screens live in `app/`.

- `app/_layout.tsx` — root layout, sets up React Navigation `ThemeProvider` and `Stack`
- `app/(tabs)/` — tab group; `_layout.tsx` defines tab bar, each file is a tab screen
- `app/modal.tsx` — modal screen accessible via `href="/modal"`

New screens go in `app/` (or a nested group). New tabs go in `app/(tabs)/`.

### Theming

Two-layer system for dark/light mode:

1. `constants/theme.ts` — source of truth for `Colors` (text, background, tint, icon, tab icons) and `Fonts`
2. `hooks/use-theme-color.ts` — reads current color scheme, returns the right color from `Colors`
3. `ThemedText` / `ThemedView` — thin wrappers around RN primitives that consume `useThemeColor`

New themed components should follow the same pattern: accept `lightColor`/`darkColor` override props, delegate to `useThemeColor`.

### Platform-specific files

expo-router resolves `.ios.tsx` before `.tsx`. Used in `components/ui/icon-symbol.ios.tsx` to swap SF Symbols on iOS for a cross-platform fallback on other platforms.

### Path aliases

`@/` maps to the project root (configured in `tsconfig.json`). Always use `@/` imports, never relative `../../`.

## Coding Style

- **Atomic components**: keep components small and single-purpose. Compose larger UI from small pieces rather than building monolithic screens.
- **Clean code**: clear names, no dead code, no unnecessary abstractions. Three similar lines of code is better than a premature abstraction.
- Prefer `StyleSheet.create` for styles; keep styles co-located with their component.
- No default exports for hooks or utilities — named exports only.
