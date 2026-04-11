## Cel pliku
Plik opisuje podstawowy kontrakt TypeScript kazdego bytu w swiecie gry. Definiuje wymagane pola transformacji i interfejs zycia encji.

## Co eksportuje
- Interfejs GameEntity

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/types/common.ts, src/physics/types.ts, src/entities/base/EntityCategory.ts.

## Jak uzywac (minimalny przyklad)
```ts
import type { GameEntity } from './GameEntity';

function isActive(entity: GameEntity): boolean {
  return entity.isAlive();
}
```

## Czego NIE robi
- Nie dostarcza implementacji zachowania encji.
- Nie zawiera metod zarzadzania komponentami.
