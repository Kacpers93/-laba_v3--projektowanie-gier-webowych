## Cel pliku
Plik agreguje eksporty modulu bazowego encji. Umozliwia import centralny klas i typow warstwy entities/base.

## Co eksportuje
- Typ EntityCategory
- Typ GameEntity
- Typ DestroyableEntity
- Typ FactionOwned
- Klasa BaseEntity
- Klasa EntityManager

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: pliki src/entities/base/EntityCategory.ts, GameEntity.ts, DestroyableEntity.ts, FactionOwned.ts, BaseEntity.ts, EntityManager.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { BaseEntity, EntityManager } from '@entities/base';
import type { GameEntity } from '@entities/base';
```

## Czego NIE robi
- Nie zawiera logiki encji.
- Nie wykonuje walidacji ani inicjalizacji runtime.
