## Cel pliku
Plik definiuje typ wpisu cache oraz pomocnicze funkcje i stale dla kluczy encji. Ujednolica rozpoznawanie kluczy podlegajacych budzetowi.

## Co eksportuje
- Interfejs CacheEntry
- Stala ENTITY_KEY_PREFIX
- Funkcja isEntityKey(key): boolean
- Funkcja estimateEntryBytes(width, height): number

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: OffscreenCanvas.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import { ENTITY_KEY_PREFIX, estimateEntryBytes, isEntityKey } from './cacheTypes';

const key = `${ENTITY_KEY_PREFIX}ship-1`;
const bytes = estimateEntryBytes(64, 64);
const entityKey = isEntityKey(key);
```

## Czego NIE robi
- Nie przechowuje stanu cache.
- Nie wykonuje eviction ani polityki LRU.
