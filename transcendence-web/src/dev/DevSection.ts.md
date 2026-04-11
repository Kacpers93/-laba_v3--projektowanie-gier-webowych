## Cel pliku
Plik definiuje pojedyncza sekcje panelu developerskiego. Zarzadza metrykami, kontrolkami i renderowaniem DOM sekcji.

## Co eksportuje
- Klasa DevSection

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: DOM API.
- Wewnetrzne: typy DevControl i DevMetric z src/dev/types.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { DevSection } from './DevSection';

const section = new DevSection('render', 'Render');
section.registerMetric('visible', 'visible', () => 42);
section.render(document.body);
section.update();
```

## Czego NIE robi
- Nie montuje calego panelu developerskiego.
- Nie przechowuje danych aplikacji poza metadanymi metryk i kontrolek.
