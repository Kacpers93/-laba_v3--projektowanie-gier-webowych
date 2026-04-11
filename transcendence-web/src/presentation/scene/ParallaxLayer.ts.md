## Cel pliku
Plik implementuje warstwe paralaksy skladajaca sie z wielu subwarstw z offsetem zaleznym od kamery. Korzysta z OffscreenCache i wspiera tiling tekstur tla.

## Co eksportuje
- Interfejs ParallaxSublayerConfig
- Klasa ParallaxLayer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CanvasRenderingContext2D, Math.
- Wewnetrzne: src/engine/renderer/Camera.ts, src/presentation/cache/OffscreenCache.ts, src/presentation/scene/SceneLayer.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { ParallaxLayer } from './ParallaxLayer';

const layer = new ParallaxLayer(cache, width, height, configs);
layer.update(0.016, camera);
layer.render(ctx, camera, 0.5);
```

## Czego NIE robi
- Nie zarzadza aktywnym wyborem presetow.
- Nie renderuje obiektow swiata ani UI.
