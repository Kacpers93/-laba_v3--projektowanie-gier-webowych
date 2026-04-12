## Cel pliku
Plik rozwija definicje asteroidGroups do listy pojedynczych asteroid wraz z computedHeight i pozycja. Generuje tez stabilne anchory klastrow dla opcji orbitAround.

## Co eksportuje
- Interfejsy: ExpandedAsteroidObject, ExpandAsteroidGroupsInput, ExpandAsteroidGroupsResult
- Funkcja expandAsteroidGroups(input): ExpandAsteroidGroupsResult

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Math.
- Wewnetrzne: src/types/common.ts, src/world/seed/deterministicRandom.ts, src/world/seed/orbitUtils.ts, src/world/seed/seedTypes.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { expandAsteroidGroups } from './expandAsteroidGroups';

const result = expandAsteroidGroups({
  groups: [],
  systemCenter: { x: 0, y: 0 },
  parentPositions: new Map(),
});
```

## Czego NIE robi
- Nie rejestruje encji w EntityManager.
- Nie waliduje kompletnego seeda systemu.
