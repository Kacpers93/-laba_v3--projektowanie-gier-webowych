## Cel pliku
Plik jest warstwa kompatybilnosci i re-exportuje implementacje ParallaxLayer z modulu feature `src/features/parallax`.

## Co eksportuje
- Interfejs ParallaxSublayerConfig
- Klasa ParallaxLayer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/features/parallax/index.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { ParallaxLayer } from './ParallaxLayer';
```

## Czego NIE robi
- Nie zawiera logiki renderowania paralaksy.
- Nie jest zrodlem prawdy dla presetow paralaksy.
