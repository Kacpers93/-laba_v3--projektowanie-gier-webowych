## Cel pliku
Plik obsluguje wejscie gry dla trybu game: klawiature, pozycje myszy i buforowane akcje. Zapewnia tez konwersje pozycji myszy do wspolrzednych swiata przez kamere.

## Co eksportuje
- Klasa GameInput

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: DOM events (keydown, keyup, mousemove, click).
- Wewnetrzne: src/types/common.ts, src/engine/renderer/Camera.ts, src/engine/input/InputModeManager.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { GameInput } from './GameInput';
import { InputModeManager } from './InputModeManager';

const mode = new InputModeManager();
const input = new GameInput(canvas, mode);
input.onAction('fire', () => {
  // reakcja na akcje
});
input.update();
```

## Czego NIE robi
- Nie mapuje klawiszy z konfigurowalnym keybindingiem.
- Nie obsluguje wejscia gamepad ani multitouch.
