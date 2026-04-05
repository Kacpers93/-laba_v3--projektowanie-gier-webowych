# src/engine/audio

## Cel folderu
Obsluga audio aplikacji na poziomie silnika.

## Co zawiera
- `AudioManager.ts`: klasa `AudioManager` do inicjalizacji `AudioContext`, odtwarzania muzyki/SFX/UI, mute i glosnosci kanalow.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: `AudioContext`, `GainNode`, `HTMLAudioElement`.
- Wewnetrzne: uzywane przez `AppShell`.

## Jak uzywac
```ts
const audio = new AudioManager();
await audio.init();
audio.playMusic('/music/theme.mp3');
```

## Czego NIE robi
- Nie zarzadza preloadem assetow audio.
- Nie synchronizuje audio z timeline rozgrywki.
