## Cel pliku
Plik agreguje i eksportuje zestawy presetow subwarstw paralaksy oraz wskazuje aktywny wariant. Ulatwia przelaczanie motywu tla przez jeden export.

## Co eksportuje
- Stale PARALLAX_SUBLAYERS_COOL, PARALLAX_SUBLAYERS_SUBTLE, PARALLAX_SUBLAYERS_WARM
- Stala ACTIVE_PARALLAX_SUBLAYERS

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/presentation/scene/parallax-presets/cool.ts, subtle.ts, warm.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { ACTIVE_PARALLAX_SUBLAYERS } from './parallax-presets';
```

## Czego NIE robi
- Nie renderuje paralaksy.
- Nie generuje konfiguracji dynamicznie w runtime.
