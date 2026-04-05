# src/app

## Cel folderu
Warstwa startowa aplikacji. Odpowiada za bootstrap oraz sklejenie kluczowych modulow runtime.

## Co zawiera
- `Bootstrap.ts`: znajduje `#root`, tworzy `AppShell` i startuje aplikacje; obsluguje fallback bledu.
- `AppShell.ts`: tworzy canvas i warstwy DOM, inicjalizuje audio/input/renderer/petle, laczy warstwy sceny.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: DOM API, zdarzenia okna (`resize`, `pointerdown`).
- Wewnetrzne: moduly z `src/engine`, `src/presentation`, style warstw i preset parallax.

## Jak uzywac
```ts
import { bootstrap } from './Bootstrap';
void bootstrap();
```

## Czego NIE robi
- Nie implementuje docelowej logiki obiektow swiata.
- Nie definiuje assetow graficznych ani danych poziomow.
