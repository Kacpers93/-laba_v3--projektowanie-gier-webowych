# src/engine/renderer

## Cel folderu
Podstawowe klasy renderowania 2D: kamera i renderer canvas.

## Co zawiera
- `Camera.ts`: klasa `Camera` (pozycja, zoom, konwersje world<->screen, transform ctx).
- `Renderer.ts`: klasa `Renderer` (tworzenie kontekstu 2D, `clear`, `resize`, wymiary viewportu).

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Canvas 2D API.
- Wewnetrzne: typ `Vector2` z `src/types/common`; uzycie przez `app` i `presentation`.

## Jak uzywac
```ts
const renderer = new Renderer(canvas);
const camera = new Camera(renderer.width, renderer.height);
```

## Czego NIE robi
- Nie implementuje zarzadzania shaderami/WebGL.
- Nie rysuje obiektow sceny bezposrednio (to robi `SceneRenderer` i warstwy).
