## Cel pliku
Plik zawiera kontrakty TypeScript dla metryk i kontrolek panelu developerskiego. Ujednolica ksztalt danych uzywanych przez DevSection.

## Co eksportuje
- Interfejs DevMetric
- Interfejs DevSelectOption
- Interfejs DevCheckboxControl
- Interfejs DevButtonControl
- Interfejs DevNumberControl
- Interfejs DevSelectControl
- Typ unii DevControl

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: typ HTMLElement.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import type { DevControl, DevMetric } from './types';

const metric: DevMetric = { id: 'fps', label: 'FPS', getter: () => 60 };
const control: DevControl = {
  id: 'toggle',
  label: 'Toggle',
  type: 'button',
  onClick: () => {},
};
```

## Czego NIE robi
- Nie zawiera logiki renderowania ani obslugi zdarzen.
- Nie waliduje runtime poprawnosci wartosci.
