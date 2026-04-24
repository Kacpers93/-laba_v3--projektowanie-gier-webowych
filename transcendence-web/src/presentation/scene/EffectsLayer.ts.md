## Cel pliku
Plik jest warstwa kompatybilnosci i re-exportuje implementacje EffectsLayer z modulu feature `src/features/world-scene`.

## Co eksportuje
- Klasa EffectsLayer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/features/world-scene/index.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { EffectsLayer } from './EffectsLayer';
```

## Czego NIE robi
- Nie zawiera logiki efektow.
- Nie jest zrodlem prawdy dla warstwy efektow.
