## Cel pliku
Plik definiuje zamkniety zbior kategorii encji uzywanych w runtime. Ujednolica nazewnictwo typow bytow.

## Co eksportuje
- Typ unii EntityCategory

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import type { EntityCategory } from './EntityCategory';

const category: EntityCategory = 'ship';
```

## Czego NIE robi
- Nie mapuje kategorii na zachowania lub profile wizualne.
- Nie zawiera walidacji runtime.
