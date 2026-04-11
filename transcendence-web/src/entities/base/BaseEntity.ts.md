## Cel pliku
Plik dostarcza abstrakcyjna bazowa implementacje kontraktu GameEntity. Ujednolica przechowywanie pozycji, predkosci, rotacji i stanu zycia bytu.

## Co eksportuje
- Abstrakcyjna klasa BaseEntity

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/types/common.ts, src/physics/types.ts, src/entities/base/EntityCategory.ts, src/entities/base/GameEntity.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { BaseEntity } from './BaseEntity';

class ShipEntity extends BaseEntity {
  public readonly boundingBox = { min: { x: -1, y: -1 }, max: { x: 1, y: 1 } };
}
```

## Czego NIE robi
- Nie implementuje metody update ani zachowan domenowych.
- Nie zarzadza rejestracja bytu w EntityManager.
