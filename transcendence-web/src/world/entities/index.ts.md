## Cel pliku
Plik agreguje eksporty modulu encji swiata. Umozliwia import klas encji seedowej i statku gracza przez jedno wejscie.

## Co eksportuje
- Klasa WorldEntity
- Klasa PlayerShipEntity

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/world/entities/WorldEntity.ts, src/world/entities/PlayerShipEntity.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { PlayerShipEntity, WorldEntity } from '@world/entities';
```

## Czego NIE robi
- Nie definiuje logiki encji.
- Nie tworzy instancji encji ani nie rejestruje ich w runtime.
