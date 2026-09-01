## Cel pliku
Plik definiuje glowna klase spinajaca runtime aplikacji: renderer, petle gry, input, audio, encje oraz composition root modulow feature. Odpowiada tez za start/stop aplikacji.

Od refaktoru logika konfiguracji sekcji dev-overlay i formularza dev-spawn jest wydzielona do `src/dev/app-shell/*`.

## Co eksportuje
- Klasa AppShell

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: DOM API, localStorage, window events, dynamic import.
- Wewnetrzne: moduly engine (audio/input/loop/renderer), entities, physics, presentation (assets/cache/profiles/renderables/scene), dev overlay, typy z src/types oraz ekstraktory dev-overlay z `src/dev/app-shell`.

## Jak uzywac (minimalny przyklad)
```ts
import { AppShell } from './AppShell.ts';

const root = document.querySelector('#root') as HTMLElement;
const appShell = new AppShell(root);
await appShell.start();
```

## Czego NIE robi
- Nie wczytuje wielu niezaleznych scen lub systemow gwiezdnych.
- Nie implementuje mechanik gameplay (np. kolizji, AI, ekonomii) jako oddzielnych systemow domenowych.
- Nie tworzy bezposrednio warstw feature, takich jak background lub parallax; robi to rejestr modulow w app/composition.
