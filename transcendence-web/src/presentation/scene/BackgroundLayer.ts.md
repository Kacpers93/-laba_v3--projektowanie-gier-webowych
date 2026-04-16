## Cel pliku
Plik implementuje warstwe tla gwiazd z cachowaniem na OffscreenCanvas. Generuje deterministyczny rozklad gwiazd (dla seeda), przesuwa tlo wzgledem kamery (depth factor), reaguje na zoom kamery i wspiera regeneracje po resize.

## Co eksportuje
- Interfejs BackgroundConfig
- Klasa BackgroundLayer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CanvasRenderingContext2D, Math.
- Wewnetrzne: src/engine/renderer/Camera.ts, src/presentation/cache/OffscreenCache.ts, src/presentation/scene/SceneLayer.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { BackgroundLayer } from './BackgroundLayer';

const layer = new BackgroundLayer(cache, width, height, {
  starCount: 300,
  minBrightness: 0.3,
  maxBrightness: 1,
  minSize: 0.5,
  maxSize: 2,
  depthFactor: 0.02,
});
```

## Czego NIE robi
- Nie renderuje encji swiata.
- Nie zarzadza paralaksa wielowarstwowa.
