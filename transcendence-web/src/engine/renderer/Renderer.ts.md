## Cel pliku
Plik implementuje podstawowy renderer canvas 2D: inicjalizuje kontekst, czyci bufor i obsluguje resize powierzchni rysowania. Udostepnia uchwyt do contextu i aktualne wymiary.

## Co eksportuje
- Klasa Renderer

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: HTMLCanvasElement, CanvasRenderingContext2D.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import { Renderer } from './Renderer';

const renderer = new Renderer(canvas);
renderer.clear();
renderer.resize(window.innerWidth, window.innerHeight);
```

## Czego NIE robi
- Nie zarzadza warstwami sceny ani cullingiem.
- Nie implementuje zaawansowanych efektow renderingu.
