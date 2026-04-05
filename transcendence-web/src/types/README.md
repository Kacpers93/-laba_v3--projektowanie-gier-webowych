# src/types

## Cel folderu
Wspolne definicje typow i interfejsow dla silnika i warstwy aplikacji.

## Co zawiera
- `common.ts`: `Vector2`, `EntityId`, `InputMode`.
- `engine.ts`: `GameLoopConfig`, `Renderable`.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: typy oparte na API Canvas 2D.
- Wewnetrzne: importowane przez `engine`, `app` i `presentation`.

## Jak uzywac
```ts
import type { Vector2 } from '@/types/common';
import type { GameLoopConfig } from '@/types/engine';
```

## Czego NIE robi
- Nie implementuje logiki runtime.
- Nie zawiera walidacji danych wejscia.
