## Cel pliku
Plik implementuje warstwe debug z siatka swiata i znacznikiem centrum kamery. Warstwa moze byc przelaczana klawiszem G.

## Co eksportuje
- Klasa DebugLayer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: DOM event keydown, CanvasRenderingContext2D.
- Wewnetrzne: src/engine/renderer/Camera.ts, src/presentation/scene/SceneLayer.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { DebugLayer } from './DebugLayer';

const debugLayer = new DebugLayer();
sceneRenderer.addLayer(debugLayer);
```

## Czego NIE robi
- Nie udostepnia panelu metryk.
- Nie diagnozuje automatycznie bledow logiki gry.
