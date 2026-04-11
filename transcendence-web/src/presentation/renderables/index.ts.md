## Cel pliku
Plik agreguje eksporty modulow renderables. Umozliwia centralny import klas warstwy renderowalnych bytow.

## Co eksportuje
- Klasa EntityRenderable
- Klasa RenderableFactory

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/presentation/renderables/EntityRenderable.ts, src/presentation/renderables/RenderableFactory.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { RenderableFactory } from '@presentation/renderables';
```

## Czego NIE robi
- Nie implementuje zadnej logiki renderowania samodzielnie.
- Nie zarzadza lista renderables sceny.
