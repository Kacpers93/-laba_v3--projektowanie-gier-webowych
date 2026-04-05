# src/presentation/scene/parallax-presets

## Cel folderu
Gotowe konfiguracje kolorystyczne i gestosciowe dla subwarstw parallax.

## Co zawiera
- `index.ts`: eksportuje wszystkie preset-y i wskazuje `ACTIVE_PARALLAX_SUBLAYERS`.
- `cool.ts`: `PARALLAX_SUBLAYERS_COOL`.
- `subtle.ts`: `PARALLAX_SUBLAYERS_SUBTLE`.
- `warm.ts`: `PARALLAX_SUBLAYERS_WARM`.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: typ `ParallaxSublayerConfig` z `scene/ParallaxLayer`.

## Jak uzywac
```ts
import { ACTIVE_PARALLAX_SUBLAYERS } from '@/presentation/scene/parallax-presets';
```
Zmiana aktywnego wariantu odbywa sie przez podmiane eksportu w `index.ts`.

## Czego NIE robi
- Nie renderuje nic samodzielnie.
- Nie przechowuje runtime stanu warstw.
