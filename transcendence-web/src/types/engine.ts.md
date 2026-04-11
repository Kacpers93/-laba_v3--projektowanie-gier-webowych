## Cel pliku
Plik definiuje kontrakty TypeScript dla petli gry i obiektow renderowalnych. Ujednolica API wykorzystywane przez runtime renderowania.

## Co eksportuje
- Interfejs GameLoopConfig
- Interfejs Renderable

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CanvasRenderingContext2D.
- Wewnetrzne: typy Vector2 i EntityId z src/types/common.ts.

## Jak uzywac (minimalny przyklad)
```ts
import type { GameLoopConfig, Renderable } from './engine';

const config: GameLoopConfig = {
  tickRate: 30,
  onFixedUpdate: () => {},
  onFrameUpdate: () => {},
  onFrameRender: () => {},
};
```

## Czego NIE robi
- Nie dostarcza implementacji petli gry.
- Nie definiuje warstw sceny ani systemu encji.
