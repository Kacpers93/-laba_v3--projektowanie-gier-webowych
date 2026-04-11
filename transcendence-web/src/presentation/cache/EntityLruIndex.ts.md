## Cel pliku
Plik implementuje indeks LRU dla kluczy cache encji. Sledzi kolejnosc dostepu i udostepnia najstarszy klucz do usuniecia.

## Co eksportuje
- Klasa EntityLruIndex

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Map.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import { EntityLruIndex } from './EntityLruIndex';

const lru = new EntityLruIndex();
lru.touch('entity-a');
const key = lru.getLruKey();
```

## Czego NIE robi
- Nie usuwa wpisow z rzeczywistego cache.
- Nie przechowuje metadanych rozmiaru wpisow.
