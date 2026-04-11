## Cel pliku
Plik obsluguje wejscie dla trybu UI, mapujac klawisze na nawigacje oraz akcje confirm/cancel. Wywoluje zarejestrowane listenery tylko gdy aktywny jest tryb ui.

## Co eksportuje
- Klasa UIInput

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: DOM event keydown.
- Wewnetrzne: src/engine/input/InputModeManager.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { UIInput } from './UIInput';
import { InputModeManager } from './InputModeManager';

const mode = new InputModeManager();
const uiInput = new UIInput(mode);
uiInput.onCancel(() => mode.setMode('game'));
```

## Czego NIE robi
- Nie renderuje zadnych elementow interfejsu.
- Nie przechowuje fokusu widgetow UI ani drzewa nawigacji.
