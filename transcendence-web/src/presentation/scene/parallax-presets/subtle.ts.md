## Cel pliku
Plik definiuje subtelny wariant konfiguracji subwarstw paralaksy o nizszej przezroczystosci. Dane maja forme statycznej tablicy configow.

## Co eksportuje
- Stala PARALLAX_SUBLAYERS_SUBTLE

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: typ ParallaxSublayerConfig z src/presentation/scene/ParallaxLayer.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { PARALLAX_SUBLAYERS_SUBTLE } from './subtle';
```

## Czego NIE robi
- Nie zarzadza aktualna warstwa paralaksy.
- Nie implementuje animacji poza parametrami statycznymi.
