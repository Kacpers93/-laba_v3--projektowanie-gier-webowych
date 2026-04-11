## Cel pliku
Plik implementuje orchestrator warstw sceny: przechowuje je, sortuje po order i wywoluje update/render. Zapewnia jednolity przeplyw renderowania klatki.

## Co eksportuje
- Klasa SceneRenderer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CanvasRenderingContext2D.
- Wewnetrzne: src/engine/renderer/Camera.ts, src/presentation/scene/SceneLayer.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { SceneRenderer } from './SceneRenderer';

const scene = new SceneRenderer();
scene.addLayer(backgroundLayer);
scene.render(ctx, camera, 0.5);
```

## Czego NIE robi
- Nie tworzy warstw automatycznie.
- Nie wykonuje cullingu encji (to rola konkretnej warstwy).
