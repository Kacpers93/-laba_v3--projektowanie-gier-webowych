## Cel pliku
Plik jest warstwa kompatybilnosci i re-exportuje implementacje WorldLayer z modulu feature `src/features/world-scene`.

## Co eksportuje
- Klasa WorldLayer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/features/world-scene/index.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { WorldLayer } from './WorldLayer';
```

## Czego NIE robi
- Nie zawiera logiki renderowania obiektow swiata.
- Nie jest zrodlem prawdy dla metryk widocznosci renderables.
