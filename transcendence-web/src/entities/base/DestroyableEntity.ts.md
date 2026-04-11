## Cel pliku
Plik rozszerza kontrakt encji o pola i metode zwiazane z obrazeniami. Sluzy jako typ dla bytow, ktore posiadaja kadlub i oslony.

## Co eksportuje
- Interfejs DestroyableEntity

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/entities/base/GameEntity.ts.

## Jak uzywac (minimalny przyklad)
```ts
import type { DestroyableEntity } from './DestroyableEntity';

function hit(entity: DestroyableEntity, amount: number): void {
  entity.takeDamage(amount);
}
```

## Czego NIE robi
- Nie implementuje algorytmu zadawania obrazen.
- Nie definiuje statusow specjalnych (np. odporności).
