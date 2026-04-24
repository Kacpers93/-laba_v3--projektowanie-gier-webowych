## Cel pliku
Plik jest warstwa kompatybilnosci i re-exportuje implementacje BackgroundLayer z modulu feature `src/features/background`.

## Co eksportuje
- Interfejs BackgroundConfig
- Klasa BackgroundLayer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/features/background/index.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { BackgroundLayer } from './BackgroundLayer';
```

## Czego NIE robi
- Nie zawiera logiki renderowania tla.
- Nie jest zrodlem prawdy dla konfiguracji background.
