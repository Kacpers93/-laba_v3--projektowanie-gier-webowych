## Cel pliku
Plik agreguje eksporty modulu encji swiata. Umozliwia import klasy encji seedowej przez jedno wejscie.

## Co eksportuje
- Klasa WorldEntity

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/world/entities/WorldEntity.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { WorldEntity } from '@world/entities';
```

## Czego NIE robi
- Nie definiuje logiki encji.
- Nie tworzy instancji encji ani nie rejestruje ich w runtime.
