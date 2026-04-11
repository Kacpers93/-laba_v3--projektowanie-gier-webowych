## Cel pliku
Plik implementuje warstwe renderowania obiektow swiata i culling na podstawie promienia renderable oraz viewportu. Przechowuje liste renderables i metryki widocznosci.

## Co eksportuje
- Klasa WorldLayer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CanvasRenderingContext2D.
- Wewnetrzne: src/engine/renderer/Camera.ts, src/types/engine.ts, src/presentation/scene/SceneLayer.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { WorldLayer } from './WorldLayer';

const worldLayer = new WorldLayer();
worldLayer.addRenderable(renderable);
worldLayer.render(ctx, camera, 0.5);
```

## Czego NIE robi
- Nie zarzadza logika zycia encji.
- Nie sortuje renderables po dodatkowych kryteriach z-order.
