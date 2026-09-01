# src/engine/audio

## Cel folderu
Obsluga audio aplikacji na poziomie silnika.

## Co zawiera
- `AudioManager.ts`: klasa `AudioManager` do inicjalizacji `AudioContext`, odtwarzania muzyki/SFX/UI, mute i glosnosci kanalow.
- `AudioRuntimeModule.ts`: runtime feature uruchamiajacy inicjalizacje audio po pierwszym `pointerdown`.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: `AudioContext`, `GainNode`, `HTMLAudioElement`.
- Wewnetrzne: uzywane przez `AppShell`.

## Jak uzywac
```ts
const audio = new AudioManager();
await audio.init();
audio.playMusic('/music/theme.mp3');
```

## Dokumentacja plikowa
- AudioManager.ts.md

## Czego NIE robi
- Nie zarzadza preloadem assetow audio.
- Nie synchronizuje audio z timeline rozgrywki.
