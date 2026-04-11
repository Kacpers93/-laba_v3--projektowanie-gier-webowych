## Cel pliku
Plik implementuje panel developerski z sekcjami metryk i kontrolek. Odpowiada za montowanie panelu, widocznosc i aktualizacje sekcji.

## Co eksportuje
- Klasa DevOverlayPanel

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: DOM API, localStorage, URLSearchParams.
- Wewnetrzne: src/dev/DevSection.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { DevOverlayPanel } from './DevOverlayPanel';

const panel = new DevOverlayPanel();
panel.mount(document.body);
const section = panel.registerSection('entities', 'Entities');
section.registerMetric('total', 'total', () => 0);
panel.update();
```

## Czego NIE robi
- Nie pobiera sam metryk runtime; tylko odczytuje getter przekazany z zewnatrz.
- Nie steruje czestotliwoscia odswiezania panelu.
