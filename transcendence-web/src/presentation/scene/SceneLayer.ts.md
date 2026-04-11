## Cel pliku
Plik definiuje interfejs kontraktu pojedynczej warstwy sceny. Ujednolica API update i render dla SceneRenderer.

## Co eksportuje
- Interfejs SceneLayer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CanvasRenderingContext2D.
- Wewnetrzne: src/engine/renderer/Camera.ts.

## Jak uzywac (minimalny przyklad)
```ts
import type { SceneLayer } from './SceneLayer';

class CustomLayer implements SceneLayer {
  readonly order = 10;
  update(): void {}
  render(): void {}
}
```

## Czego NIE robi
- Nie implementuje zadnej konkretnej warstwy.
- Nie zarzadza lista warstw.
