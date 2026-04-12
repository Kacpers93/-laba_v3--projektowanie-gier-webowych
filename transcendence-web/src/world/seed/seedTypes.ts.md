## Cel pliku
Plik definiuje kontrakty danych seeda systemu oraz stale pomocnicze do wysokosci renderowania i walidacji typow. Standaryzuje format danych wykorzystywany przez loader.

## Co eksportuje
- Interfejsy: SystemSeed, SeedObject, AsteroidClusterAnchor, AsteroidGroupDef
- Typy: SeedObjectType, RuntimeSeedObjectType
- Stale: BASE_HEIGHT_BY_SEED_TYPE, SEED_OBJECT_TYPES

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/types/common.ts.

## Jak uzywac (minimalny przyklad)
```ts
import type { SystemSeed } from './seedTypes';

const seed: SystemSeed = {
  schemaVersion: 1,
  systemId: 'sol-001',
  name: 'Sol',
  center: { x: 0, y: 0 },
  informationalBoundaryRadius: 1000,
  maxBoundaryRadius: 2000,
  objects: [],
  asteroidGroups: [],
};
```

## Czego NIE robi
- Nie waliduje danych runtime.
- Nie wykonuje obliczen pozycji orbitalnych.
