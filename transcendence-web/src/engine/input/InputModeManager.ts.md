## Cel pliku
Plik zarzadza aktualnym trybem wejscia aplikacji (game/ui/locked). Udostepnia API zmiany trybu i powiadamiania subskrybentow.

## Co eksportuje
- Klasa InputModeManager

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CustomEvent, window.dispatchEvent.
- Wewnetrzne: typ InputMode z src/types/common.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { InputModeManager } from './InputModeManager';

const modeManager = new InputModeManager();
modeManager.onModeChanged((mode) => console.log(mode));
modeManager.setMode('ui');
```

## Czego NIE robi
- Nie mapuje wejscia klawiatury ani myszy.
- Nie przechowuje historii zmian trybu.
