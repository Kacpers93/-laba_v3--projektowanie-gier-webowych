## Cel pliku
Plik implementuje prosty rejestr aktywnych bytow sceny oparty o Map. Udostepnia operacje dodawania, usuwania, filtrowania i sprzatania nieaktywnych encji.

## Co eksportuje
- Klasa EntityManager

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Map.
- Wewnetrzne: src/types/common.ts, src/entities/base/EntityCategory.ts, src/entities/base/GameEntity.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { EntityManager } from './EntityManager';

const entities = new EntityManager();
entities.add(entity);
const ships = entities.getByCategory('ship');
```

## Czego NIE robi
- Nie wykonuje aktualizacji tickowej encji.
- Nie zawiera logiki kolizji ani serializacji.
