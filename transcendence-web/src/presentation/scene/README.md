# src/presentation/scene

## Cel folderu
Definicje warstw sceny i renderer, ktory zarzadza ich kolejnoscia, aktualizacja i rysowaniem.

## Co zawiera
- `SceneLayer.ts`: interfejs `SceneLayer` (`order`, `update`, `render`).
- `SceneRenderer.ts`: klasa `SceneRenderer` do dodawania/usuwania warstw oraz wywolan `update`/`render`.
- `BackgroundLayer.ts`: statyczne tlo gwiazd z cache offscreen.
- `ParallaxLayer.ts`: wielowarstwowy parallax z tile i przesunieciem zaleznym od kamery.
- `WorldLayer.ts`: warstwa swiata z cullingiem i sortowaniem po computedHeight.
- `EffectsLayer.ts`: stub warstwy efektow (Etap 2/9).
- `DebugLayer.ts`: opcjonalna siatka debug i marker centrum kamery (toggle klawiszem `G`).
- `parallax-presets/`: zestawy konfiguracji subwarstw parallax.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Canvas 2D API, zdarzenia klawiatury.
- Wewnetrzne: `Camera` z `engine/renderer`, `OffscreenCache` z `presentation/cache`.

## Jak uzywac
```ts
sceneRenderer.addLayer(new BackgroundLayer(cache, w, h, cfg));
sceneRenderer.addLayer(new ParallaxLayer(cache, w, h, preset));
sceneRenderer.addLayer(new WorldLayer());
```

## Dokumentacja plikowa
- SceneLayer.ts.md
- SceneRenderer.ts.md
- BackgroundLayer.ts.md
- ParallaxLayer.ts.md
- WorldLayer.ts.md
- EffectsLayer.ts.md
- DebugLayer.ts.md
- parallax-presets/index.ts.md
- parallax-presets/cool.ts.md
- parallax-presets/subtle.ts.md
- parallax-presets/warm.ts.md

## Czego NIE robi
- Nie zawiera kompletnej logiki obiektow gry.
- Nie zarzadza petla czasu (to odpowiedzialnosc `GameLoop`).
