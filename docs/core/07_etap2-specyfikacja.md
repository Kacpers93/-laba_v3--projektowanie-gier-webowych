# Etap 2 — Specyfikacja uzupełniająca

## Cel
Dokument zamyka luki zgłoszone w review przed Etapem 2.
Dotyczy: `presentation/scene/`, `presentation/cache/`, `styles/`.
Buduje na fundamencie Etapu 1 (AppShell, Renderer, Camera, GameLoop).

---

## 1. Warstwy renderu (Scene Pipeline)

### Decyzja
Wszystko rysowane jest na jednym canvasie (`#game-layer`). Warstwy renderu to logiczny porządek wywołań w `SceneRenderer`, nie osobne canvasy ani elementy DOM.

### Warstwy i kolejność rysowania

```
┌─── SceneRenderer.render(ctx, camera, alpha) ───┐
│                                                  │
│  0. ctx.clearRect(...)                           │
│  1. BackgroundLayer    ← gwiazdy stałe (skybox)  │
│  2. ParallaxLayer      ← mgławice, chmury pyłu   │
│  3. WorldLayer         ← obiekty świata (Etap 3+) │
│  4. EffectsLayer       ← cząstki, eksplozje (Etap 9) │
│  5. DebugLayer         ← siatka, AABB, logi (dev) │
│                                                  │
└──────────────────────────────────────────────────┘
```

| # | Warstwa | Plik | Co rysuje | Reaguje na kamerę |
|---|---|---|---|---|
| 1 | `BackgroundLayer` | `scene/BackgroundLayer.ts` | Statyczne gwiazdy — siatka losowych punktów, bez ruchu. Rysowane raz do cache, potem blit. | Nie — ekranowe współrzędne, stały skybox. |
| 2 | `ParallaxLayer` | `scene/ParallaxLayer.ts` | 1–3 warstwy paralaksy (mgławice, pył). Każda przesuwa się z innym współczynnikiem względem kamery. | Tak — przesunięcie = `camera.position * factor`. |
| 3 | `WorldLayer` | `scene/WorldLayer.ts` | Obiekty świata (statki, stacje, wrota, asteroidy). Stub w Etapie 2 — rysuje placeholder. | Tak — pełna transformacja kamery. |
| 4 | `EffectsLayer` | `scene/EffectsLayer.ts` | Cząstki, eksplozje, ślady silników. Stub w Etapie 2 — pusty. | Tak. |
| 5 | `DebugLayer` | `scene/DebugLayer.ts` | Siatka, wyznaczniki kamery, AABB kolizji. Włączane flagą `debug`. | Tak. |

### Kontrakt `SceneLayer`

```typescript
// presentation/scene/SceneLayer.ts

export interface SceneLayer {
  /** Kolejność rysowania — mniejsza = wcześniej. */
  readonly order: number;

  /** Aktualizacja stanu warstwy (np. animacja paralaksy). */
  update(dt: number, camera: Camera): void;

  /** Rysowanie na context. */
  render(ctx: CanvasRenderingContext2D, camera: Camera, alpha: number): void;
}
```

### `SceneRenderer`

```typescript
// presentation/scene/SceneRenderer.ts

import type { SceneLayer } from './SceneLayer';

export class SceneRenderer {
  private layers: SceneLayer[] = [];

  /** Dodaje warstwę. Sortuje po order. */
  addLayer(layer: SceneLayer): void;

  /** Usuwa warstwę. */
  removeLayer(layer: SceneLayer): void;

  /** Wywoływane w onFrameUpdate — aktualizuje wszystkie warstwy. */
  update(dt: number, camera: Camera): void;

  /** Wywoływane w onFrameRender — rysuje wszystkie warstwy po kolei. */
  render(ctx: CanvasRenderingContext2D, camera: Camera, alpha: number): void;
}
```

### Integracja z AppShell

`AppShell` tworzy `SceneRenderer` i rejestruje warstwy w konstruktorze, a `start()` uruchamia pętlę. Callbacki `GameLoop` są spięte z rendererem sceny:

```
onFrameUpdate  → sceneRenderer.update(dt, camera)
onFrameRender  → renderer.clear()
               → sceneRenderer.render(renderer.ctx, camera, alpha)
```

---

## 2. Tło i paralaksa — decyzja

### Decyzja
Tło i paralaksa to warstwy canvas rysowane przez SceneRenderer. Nie są osobnymi elementami DOM. Nie są osobnymi canvasami.

### `BackgroundLayer` — szczegóły

- Generuje na starcie losową siatkę gwiazd (N punktów, pozycje + jasność + rozmiar).
- Rysuje je raz na offscreen canvas (cache) o rozmiarze viewportu.
- Co klatkę robi `drawImage` z cache na główny canvas.
- Przy resize okna: regeneruje cache.
- Gwiazdy nie reagują na ruch kamery — to tło kosmiczne, nieskończenie daleko.

```typescript
// presentation/scene/BackgroundLayer.ts

export class BackgroundLayer implements SceneLayer {
  readonly order = 0;

  constructor(config: BackgroundConfig);

  /** Nic do roboty co klatkę — tło jest statyczne. */
  update(dt: number, camera: Camera): void;

  /** Blit z cache. */
  render(ctx: CanvasRenderingContext2D, camera: Camera, alpha: number): void;

  /** Generuje nowy cache (wywołaj po resize). */
  regenerate(width: number, height: number): void;
}

interface BackgroundConfig {
  starCount: number;        // ilość gwiazd (domyślnie 400)
  minBrightness: number;    // 0–1 (domyślnie 0.3)
  maxBrightness: number;    // 0–1 (domyślnie 1.0)
  minSize: number;          // px (domyślnie 0.5)
  maxSize: number;          // px (domyślnie 2.0)
  seed?: number;            // opcjonalny seed do powtarzalnej generacji
}
```

### `ParallaxLayer` — szczegóły

- Składa się z 1–3 sub-warstw, każda z innym `depthFactor` (0–1).
- `depthFactor = 0` → nie rusza się (jak background).
- `depthFactor = 1` → rusza się 1:1 z kamerą (jak obiekty świata).
- Typowe wartości: 0.05, 0.15, 0.30.
- Każda sub-warstwa to offscreen canvas z prerenderowaną teksturą/mgławicą, tileable lub większą niż viewport.
- Co klatkę: oblicz offset = `camera.position * depthFactor`, rysuj z uwzględnieniem offsetu (wrap/tile jeśli trzeba).

```typescript
// presentation/scene/ParallaxLayer.ts

export class ParallaxLayer implements SceneLayer {
  readonly order = 1;

  constructor(sublayers: ParallaxSublayerConfig[]);

  /** Aktualizuje offsety na podstawie kamery. */
  update(dt: number, camera: Camera): void;

  /** Rysuje sub-warstwy od najdalszej. */
  render(ctx: CanvasRenderingContext2D, camera: Camera, alpha: number): void;
}

interface ParallaxSublayerConfig {
  depthFactor: number;         // 0–1 (jak bardzo reaguje na kamerę)
  texture: OffscreenCanvas;    // prerenderowana tekstura
  tileX: boolean;              // czy tilować horyzontalnie
  tileY: boolean;              // czy tilować wertykalnie
  opacity: number;             // 0–1
}
```

W Etapie 2 sub-warstwy generują proceduralną teksturę (losowe plamy kolorowe na ciemnym tle). Docelowe assety graficzne wchodzą w Etapie 4/9.

---

## 3. Cache — kontrakt API

### Cel
`presentation/cache/` odpowiada za offscreen pre-rendering obiektów, które zmieniają się rzadko. Eliminuje powtórne rysowanie skomplikowanych kształtów co klatkę.

### Decyzja
W Etapie 2 cache obsługuje wyłącznie tło i paralaksę. Cache dla bytów świata (statki, stacje) wejdzie w Etapie 3.

### API

```typescript
// presentation/cache/OffscreenCache.ts

export class OffscreenCache {
  /**
   * Pobiera lub tworzy offscreen canvas o danym kluczu.
   * Jeśli klucz istnieje i rozmiar się zgadza — zwraca z cache.
   * Jeśli nie istnieje lub rozmiar się zmienił — tworzy nowy i woła renderFn.
   */
  getOrCreate(
    key: string,
    width: number,
    height: number,
    renderFn: (ctx: OffscreenCanvasRenderingContext2D) => void
  ): OffscreenCanvas;

  /** Wymusza odświeżenie cache dla danego klucza. */
  invalidate(key: string): void;

  /** Czyści cały cache (np. przy zmianie systemu gwiezdnego). */
  clear(): void;

  /** Ile wpisów w cache. */
  readonly size: number;

  /** Sumaryczny rozmiar pamięci (szacowany: width * height * 4 bajty per wpis). */
  readonly estimatedBytes: number;
}
```

### Kiedy cache się odświeża

| Sytuacja | Akcja |
|---|---|
| Resize okna | `backgroundLayer.regenerate(width, height)` i `parallaxLayer.regenerate(width, height)` (wewnętrznie `invalidate` odpowiednich kluczy). |
| Zmiana systemu gwiezdnego | `clear()` — inne tło, inne mgławice, inny seed. |
| Zmiana zoomu kamery | Paralaksa **nie** jest inwalidowana — przesuwa się offset, nie treść. Background też nie — jest ekranowy. |
| Co klatkę | Nic — cache jest stabilny dopóki nie nastąpi jedno z powyższych. |

### Reguły

- Klucze cache to stringi czytelne dla człowieka: `'background'`, `'parallax-0'`, `'parallax-1'`, `'parallax-2'`.
- Maksymalny rozmiar cache nie jest limitowany w Etapie 2 (kilka canvasów to < 50 MB). Limit wejdzie z cache'owaniem bytów w Etapie 3.
- `OffscreenCache` jest singletonem — żyje w `AppShell` i jest przekazywany do warstw, które go potrzebują.

---

## 4. Style — decyzja

### Decyzja
W Etapie 2 tworzymy dwa pliki w `styles/`. Nie rozbijamy dalej — to za wcześnie.

### Pliki

| Plik | Rola | Zawartość |
|---|---|---|
| `styles/reset.css` | Eliminacja domyślnych styli przeglądarki | Już istnieje z Etapu 1. `margin: 0`, `padding: 0`, `box-sizing: border-box`, `overflow: hidden` na body. |
| `styles/layers.css` | Style trzech warstw AppShell | Pozycjonowanie `#game-layer`, `#hud-layer`, `#screen-layer` — fullscreen, absolute, z-index. |

### `styles/layers.css`

```css
/* Wspólne dla wszystkich warstw */
#game-layer,
#hud-layer,
#screen-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Canvas gry */
#game-layer {
  z-index: 0;
  display: block;
}

/* HUD overlay */
#hud-layer {
  z-index: 1;
  pointer-events: none;
}

/* Ekrany pełne i modale */
#screen-layer {
  z-index: 2;
  pointer-events: none;
}
```

### Importowanie

`main.ts` importuje oba:

```typescript
import '@/styles/reset.css';
import '@/styles/layers.css';
```

### Co **nie** wchodzi w Etapie 2

- Style HUD, ekranów, widgetów — to Etap 7.
- Zmienne CSS, tokeny kolorów, typografia — wejdą gdy pojawi się UI.
- Style per komponent — każdy ekran/widget przynosi swój CSS w swoim folderze (opisane w `03_ui-dom.md`).

---

## 5. Definicja „done" dla Etapu 2

### Co działa po `npm run dev`

Po uruchomieniu `npm run dev` i otwarciu `http://localhost:5173`:

1. **Tło z gwiazdami** — zamiast czarnego canvasu, widać losowo rozmieszczone gwiazdy (jasne punkty różnej wielkości na czarnym tle). Gwiazdy nie reagują na ruch kamery.
2. **Paralaksa** — poruszanie kamerą (strzałki w trybie `game`) powoduje widoczne przesunięcie 2–3 warstw mgławic/pyłu z różną prędkością. Bliższe warstwy reagują silniej na ruch kamery. Parallax jest proceduralny (losowe plamy kolorowe) — nie wymaga assetów.
3. **Debug grid** — po wciśnięciu klawisza (np. `F3` lub `G`) pojawia/znika siatka współrzędnych świata. Siatka przesuwa się z kamerą.
4. **Resize działa** — zmiana rozmiaru okna przeglądarki poprawnie skaluje canvas, regeneruje cache tła, paralaksa dostosowuje się bez artefaktów.
5. **Warstwy widoczne w kodzie** — `SceneRenderer` zarządza warstwami, warstwy są zarejestrowane w poprawnej kolejności.
6. **Cache działa** — tło i paralaksa korzystają z `OffscreenCache`. W DevTools nie widać ponownego generowania co klatkę (brak spadku FPS).
7. **Brak błędów** — zero błędów w konsoli. `npm run type-check` przechodzi bez errorów. `npm run build` buduje bez błędów.

### Artefakty zamykające Etap 2

| Artefakt | Stan |
|---|---|
| `presentation/scene/SceneLayer.ts` — interfejs | Gotowy |
| `presentation/scene/SceneRenderer.ts` — orkiestrator | Gotowy, wpięty w AppShell |
| `presentation/scene/BackgroundLayer.ts` — gwiazdy | Widoczne, cache'owane |
| `presentation/scene/ParallaxLayer.ts` — paralaksa | Widoczna, reaguje na kamerę |
| `presentation/scene/WorldLayer.ts` — stub | Pusty, zarejestrowany |
| `presentation/scene/EffectsLayer.ts` — stub | Pusty, zarejestrowany |
| `presentation/scene/DebugLayer.ts` — siatka | Przełączalna klawiszem |
| `presentation/cache/OffscreenCache.ts` — cache | Używany przez Background i Parallax |
| `styles/layers.css` — style warstw | Załadowany |
| `styles/reset.css` — reset (z Etapu 1) | Bez zmian |
| `npm run type-check` | 0 errors |
| `npm run build` | Buduje bez błędów |

### Czego NIE ma w Etapie 2

- Żadnych obiektów świata (statki, stacje) — WorldLayer jest stubem.
- Żadnych efektów cząsteczkowych — EffectsLayer jest stubem.
- Żadnych assetów graficznych (PNG, sprite sheety) — paralaksa jest proceduralna.
- Żadnego HUD, menu, UI.
- Brak zmian w `engine/`, `physics/`, `types/`. Integracja warstw sceny i obsługa resize w `app/AppShell.ts` wchodzi w zakres Etapu 2.

---

## 6. Struktura plików Etapu 2

```
src/
├── presentation/
│   ├── scene/
│   │   ├── SceneLayer.ts          ← interfejs
│   │   ├── SceneRenderer.ts       ← orkiestrator
│   │   ├── BackgroundLayer.ts     ← gwiazdy (cache)
│   │   ├── ParallaxLayer.ts       ← paralaksa (cache)
│   │   ├── WorldLayer.ts          ← stub
│   │   ├── EffectsLayer.ts        ← stub
│   │   └── DebugLayer.ts          ← siatka debug
│   └── cache/
│       └── OffscreenCache.ts      ← cache offscreen canvasów
└── styles/
    ├── reset.css                  ← (z Etapu 1)
    └── layers.css                 ← NOWY
```

---

## Podsumowanie zmian do istniejących dokumentów

| Dokument | Zmiana |
|---|---|
| `04_presentation-assets.md` | Dodać link: „Kontrakty scene i cache: `07_etap2-specyfikacja.md`". |
| `05_plan-prac.md` | Dodać link do definicji done: „Kryteria zamknięcia Etapu 2: `07_etap2-specyfikacja.md`, sekcja 5". |
| `06_etap1-specyfikacja.md` | Bez zmian. |
