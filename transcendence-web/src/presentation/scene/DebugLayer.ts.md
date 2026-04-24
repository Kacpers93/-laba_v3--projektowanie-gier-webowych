## Cel pliku
Plik jest warstwa kompatybilnosci i re-exportuje implementacje DebugLayer z modulu feature `src/features/world-scene`.

## Co eksportuje
- Klasa DebugLayer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/features/world-scene/index.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { DebugLayer } from './DebugLayer';
```

## Czego NIE robi
- Nie zawiera logiki siatki debug.
- Nie jest zrodlem prawdy dla klawiszy debug.
