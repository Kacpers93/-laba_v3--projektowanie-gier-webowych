## Cel pliku
Plik definiuje kontrakty danych profilu wizualnego i zrodla grafiki. Opisuje parametry potrzebne do tworzenia renderowalnych bytow.

## Co eksportuje
- Interfejs VisualProfile
- Typ unii VisualSource
- Typ ProceduralDrawFn

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CanvasRenderingContext2D, OffscreenCanvasRenderingContext2D.
- Wewnetrzne: typ EntityCategory z src/entities/base/EntityCategory.ts.

## Jak uzywac (minimalny przyklad)
```ts
import type { VisualProfile } from './VisualProfile';

const profile: VisualProfile = {
  profileId: 'dev-ship',
  category: 'ship',
  size: { width: 48, height: 30 },
  cullRadius: 32,
  source: { type: 'procedural', drawFn: () => {} },
};
```

## Czego NIE robi
- Nie renderuje obiektow samodzielnie.
- Nie przechowuje rejestru profili.
