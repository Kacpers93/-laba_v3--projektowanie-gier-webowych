## Cel pliku
Plik definiuje kamere 2D odpowiadajaca za transformacje world<->screen i ustawienie macierzy renderowania. Przechowuje pozycje oraz zoom kamery.

## Co eksportuje
- Klasa Camera

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CanvasRenderingContext2D.
- Wewnetrzne: typ Vector2 z src/types/common.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { Camera } from './Camera';

const camera = new Camera(1280, 720);
camera.position = { x: 100, y: 50 };
const screen = camera.worldToScreen({ x: 120, y: 70 });
```

## Czego NIE robi
- Nie wykonuje smooth-follow ani ograniczen mapy.
- Nie zarzadza kolejnoscia warstw renderowania.
