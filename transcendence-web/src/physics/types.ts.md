## Cel pliku
Plik definiuje typy fizyczne wykorzystywane przez logike encji i kolizje. Zawiera kontrakt AABB oraz wynik kolizji.

## Co eksportuje
- Interfejs AABB
- Interfejs CollisionResult

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: typ Vec2 z src/physics/Vector2.ts.

## Jak uzywac (minimalny przyklad)
```ts
import type { AABB } from './types';
import { Vec2 } from './Vector2';

const box: AABB = {
  min: new Vec2(-1, -1),
  max: new Vec2(1, 1),
};
```

## Czego NIE robi
- Nie zawiera implementacji solvera kolizji.
- Nie definiuje komponentow fizyki cial sztywnych.
