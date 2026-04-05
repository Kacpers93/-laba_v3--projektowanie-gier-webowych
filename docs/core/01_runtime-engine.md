# Runtime i engine

## Zakres
Ten dokument opisuje fundament aplikacji:
- start runtime,
- pętlę gry,
- input mode,
- renderer i kamerę,
- audio,
- podstawowe kontrakty współdzielone.

## Foldery
- `app/` — bootstrap aplikacji, shell, składanie runtime.
- `engine/loop/` — game loop, delta time, pause, przejścia stanów.
- `engine/input/` — sterowanie gry, sterowanie UI, keybindy, tracker myszy.
- `engine/renderer/` — renderer Canvas 2D, kamera, warstwy renderu.
- `engine/audio/` — audio manager, muzyka, SFX, UI sounds.
- `physics/` — matematyka, ruch, kolizje, spatial indexing.
- `types/` — typy i kontrakty używane globalnie.

## Minimalne moduły startowe
- `app/AppShell.ts`
- `app/Bootstrap.ts`
- `engine/loop/GameLoop.ts`
- `engine/input/InputModeManager.ts`
- `engine/input/GameInput.ts`
- `engine/input/UIInput.ts`
- `engine/renderer/Renderer.ts`
- `engine/renderer/Camera.ts`
- `engine/audio/AudioManager.ts`

## Reguły
- `InputModeManager` ma tylko stany: `game`, `ui`, `locked`.
- `GameInput` działa tylko w trybie `game`.
- `UIInput` działa tylko w trybie `ui`.
- `locked` służy do przejść, fade i ładowania.
- Audio dzielimy logicznie na muzykę, SFX i UI.

## Poza zakresem
Ten dokument nie opisuje:
- szczegółów ekranów UI,
- struktur menu,
- profili wizualnych obiektów,
- mechanik gameplayowych.