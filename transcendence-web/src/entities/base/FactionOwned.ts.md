## Cel pliku
Plik definiuje prosty kontrakt obiektu posiadajacego przynaleznosc frakcyjna. Umozliwia oznaczanie encji jako neutralnych lub nalezacych do frakcji.

## Co eksportuje
- Interfejs FactionOwned

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import type { FactionOwned } from './FactionOwned';

const owner: FactionOwned = { factionId: 'federation' };
```

## Czego NIE robi
- Nie zawiera logiki relacji miedzy frakcjami.
- Nie wymusza istnienia identyfikatora frakcji.
