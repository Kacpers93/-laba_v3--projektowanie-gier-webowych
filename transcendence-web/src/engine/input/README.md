# src/engine/input

## Cel folderu
Obsluga wejscia uzytkownika oraz przelaczanie trybow sterowania.

## Co zawiera
- `GameInput.ts`: klasa `GameInput` dla klawiatury i pozycji myszy wzgledem swiata, z buforowaniem akcji.
- `InputModeManager.ts`: klasa `InputModeManager` do zarzadzania trybem `game`/`ui`/`locked` i listenerami.
- `UIInput.ts`: klasa `UIInput` do nawigacji i akcji UI w trybie `ui`.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: zdarzenia `keydown`, `keyup`, `mousemove`, `click`.
- Wewnetrzne: typy z `src/types/common`, kamera z `src/engine/renderer/Camera`.

## Jak uzywac
```ts
const modes = new InputModeManager();
const gameInput = new GameInput(canvas, modes);
gameInput.onAction('toggle-ui', () => modes.setMode('ui'));
```

## Dokumentacja plikowa
- GameInput.ts.md
- InputModeManager.ts.md
- UIInput.ts.md

## Czego NIE robi
- Nie mapuje kontrolerow gamepad.
- Nie przechowuje konfiguracji keybindow poza kodem.
