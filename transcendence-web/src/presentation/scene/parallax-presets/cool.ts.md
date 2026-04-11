## Cel pliku
Plik definiuje gotowy zestaw chlodnych kolorystycznie subwarstw paralaksy. Zawiera statyczna tablice konfiguracji ParallaxSublayerConfig.

## Co eksportuje
- Stala PARALLAX_SUBLAYERS_COOL

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: typ ParallaxSublayerConfig z src/presentation/scene/ParallaxLayer.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { PARALLAX_SUBLAYERS_COOL } from './cool';
```

## Czego NIE robi
- Nie wybiera aktywnego presetu.
- Nie zawiera logiki renderowania tla.
