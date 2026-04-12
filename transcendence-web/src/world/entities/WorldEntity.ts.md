## Cel pliku
Plik definiuje konkretna encje swiata tworzoną z danych seeda. Klasa przechowuje metadane renderowania i podstawowy bounding box.

## Co eksportuje
- Klasa WorldEntity

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/types/common.ts, src/entities/base/BaseEntity.ts, src/entities/base/EntityCategory.ts, src/physics/Vector2.ts, src/physics/types.ts, src/world/seed/seedTypes.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { WorldEntity } from '@world/entities';

const entity = new WorldEntity({
  id: 'station-1',
  category: 'station',
  seedType: 'station',
  position: { x: 0, y: 0 },
  width: 96,
  height: 96,
  computedHeight: 6,
  isStatic: true,
  profileId: 'trading-outpost',
});
```

## Czego NIE robi
- Nie oblicza pozycji orbitalnych.
- Nie implementuje metody update z logika gameplay.
