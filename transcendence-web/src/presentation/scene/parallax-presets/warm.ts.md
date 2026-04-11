## Cel pliku
Plik definiuje cieply wariant konfiguracji subwarstw paralaksy. Udostepnia gotowa tablice parametrow kolorow, opacity i depthFactor.

## Co eksportuje
- Stala PARALLAX_SUBLAYERS_WARM

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: typ ParallaxSublayerConfig z src/presentation/scene/ParallaxLayer.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { PARALLAX_SUBLAYERS_WARM } from './warm';
```

## Czego NIE robi
- Nie przelacza aktywnego presetu bezposrednio.
- Nie renderuje tla samodzielnie.
