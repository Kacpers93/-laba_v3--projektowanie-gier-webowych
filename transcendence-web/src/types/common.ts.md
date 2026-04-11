## Cel pliku
Plik zawiera podstawowe, wspolne typy domeny runtime (wektor 2D, identyfikator encji, tryb wejscia). Stanowi lekki kontrakt uzywany przez wiele modulow.

## Co eksportuje
- Interfejs Vector2
- Typ EntityId
- Typ InputMode

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import type { Vector2, InputMode } from './common';

const pos: Vector2 = { x: 0, y: 0 };
const mode: InputMode = 'game';
```

## Czego NIE robi
- Nie zawiera logiki operacji matematycznych.
- Nie opisuje zaawansowanych kontraktow silnika.
