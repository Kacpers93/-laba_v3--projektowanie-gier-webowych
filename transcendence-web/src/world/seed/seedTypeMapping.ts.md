## Cel pliku
Plik definiuje statyczne mapowanie typu obiektu z seeda na kategorie encji runtime. Zapewnia jednoznaczny kontrakt przypisania kategorii.

## Co eksportuje
- Stala SEED_TYPE_TO_CATEGORY

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/entities/base/EntityCategory.ts, src/world/seed/seedTypes.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { SEED_TYPE_TO_CATEGORY } from './seedTypeMapping';

const category = SEED_TYPE_TO_CATEGORY['npc-ship'];
```

## Czego NIE robi
- Nie mapuje typu asteroid runtime.
- Nie waliduje poprawnosci danych seeda.
