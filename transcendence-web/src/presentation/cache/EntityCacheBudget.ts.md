## Cel pliku
Plik przechowuje licznik zuzycia pamieci dla cache encji i limit budzetu. Dostarcza operacje dodawania/odejmowania bajtow oraz metryki zuzycia.

## Co eksportuje
- Klasa EntityCacheBudget

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Math.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import { EntityCacheBudget } from './EntityCacheBudget';

const budget = new EntityCacheBudget(64 * 1024 * 1024);
budget.add(4096);
const full = budget.isFull();
```

## Czego NIE robi
- Nie przechowuje samych wpisow cache.
- Nie wybiera elementow do eviction.
