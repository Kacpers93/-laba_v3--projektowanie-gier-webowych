# Etap 1 — Specyfikacja uzupełniająca

## Cel
Dokument zamyka luki zgłoszone w review dokumentacji.
Dotyczy wyłącznie Etapu 1 (`app/`, `engine/`, `physics/`, `types/`).
Po wdrożeniu tych ustaleń istniejące dokumenty `00`–`05` + `architecture` pozostają aktualne — ten plik je doprecyzowuje, nie zastępuje.

---

## 1. Warstwa startowa — rozwiązanie niespójności

### Decyzja
`index.html` zawiera **minimalny** markup. Warstwy tworzy `AppShell` w runtime.

### Docelowy `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Transcendence</title>
  <link rel="stylesheet" href="/src/styles/reset.css" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### Co robi `AppShell`

`AppShell` montuje w `#root` trzy warstwy:

```
#root
├── #game-layer      ← <canvas> (fullscreen, z-index: 0)
├── #hud-layer       ← <div>    (pointer-events: none, z-index: 1)
└── #screen-layer    ← <div>    (pointer-events: none, z-index: 2)
```

- `#game-layer` to `<canvas>` tworzony przez `AppShell` i przekazywany do `Renderer`.
- `#hud-layer` i `#screen-layer` to kontenery DOM — pasywne (pointer-events: none); interaktywne są ich elementy potomne.
- `index.html` **nie** zawiera żadnego `<canvas>` ani `#ui-root` — to odpowiedzialność `AppShell`.

### Korekta do `00_vite-runtime-konfiguracja.md`
Sekcja „Konfiguracja index.html" powinna zostać zaktualizowana zgodnie z powyższym. Dotychczasowy zapis (`#gameCanvas` + `#ui-root`) jest zastąpiony przez `#root` + tworzenie warstw w runtime.

---

## 2. Kontrakty API modułów Etapu 1

### `Bootstrap`

```
Plik:       app/Bootstrap.ts
Rola:       Jednorazowa inicjalizacja — tworzy AppShell i uruchamia go.
Eksport:    function bootstrap(): Promise<void>
Zależności: AppShell
Wywołanie:  main.ts → bootstrap()
```

- Pobiera `#root` z DOM.
- Tworzy instancję `AppShell(root)`.
- Woła `appShell.start()`.
- Obsługuje błędy top-level (catch → ekran błędu w DOM).

### `AppShell`

```
Plik:       app/AppShell.ts
Rola:       Korzeń runtime — tworzy warstwy, łączy systemy, uruchamia loop.
```

| Metoda / Pole | Opis |
|---|---|
| `constructor(root: HTMLElement)` | Tworzy `#game-layer`, `#hud-layer`, `#screen-layer` w podanym kontenerze. |
| `start(): void` | Inicjalizuje Renderer, Camera, AudioManager, InputModeManager, GameLoop. Woła `gameLoop.start()`. |
| `stop(): void` | Zatrzymuje GameLoop, czyści listenery. |
| `readonly canvas: HTMLCanvasElement` | Referencja do canvasu (`#game-layer`). |
| `readonly renderer: Renderer` | Instancja renderera. |
| `readonly gameLoop: GameLoop` | Instancja pętli gry. |
| `readonly audioManager: AudioManager` | Instancja managera audio. |
| `readonly inputModeManager: InputModeManager` | Instancja managera trybu inputu. |

### `GameLoop`

```
Plik:       engine/loop/GameLoop.ts
Rola:       Pętla gry z fixed timestep dla logiki i variable timestep dla renderu.
```

| Metoda / Pole | Opis |
|---|---|
| `constructor(config: GameLoopConfig)` | Przyjmuje konfigurację tick rate i callbacki. |
| `start(): void` | Rozpoczyna requestAnimationFrame loop. |
| `stop(): void` | Zatrzymuje loop (cancelAnimationFrame). |
| `pause(): void` | Wstrzymuje aktualizację logiki i renderu. Loop dalej bije, ale callbacki nie są wywoływane. |
| `resume(): void` | Wznawia po pause. |
| `readonly isPaused: boolean` | Aktualny stan pauzy. |
| `readonly isRunning: boolean` | Czy loop jest aktywny. |

Callbacki przekazywane w `GameLoopConfig`:

| Callback | Kiedy | Argumenty |
|---|---|---|
| `onFixedUpdate(dt: number)` | Co tick logiki (stały dt) | `dt` w sekundach (stałe = 1/tickRate) |
| `onFrameUpdate(dt: number, alpha: number)` | Co klatkę renderową | `dt` = czas od ostatniej klatki, `alpha` = interpolacja |
| `onFrameRender(alpha: number)` | Po onFrameUpdate, do rysowania | `alpha` = pozycja między dwoma tickami logiki |

### `Renderer`

```
Plik:       engine/renderer/Renderer.ts
Rola:       Opakowuje Canvas 2D context, zarządza rozmiarem canvasu, czyści klatkę.
```

| Metoda / Pole | Opis |
|---|---|
| `constructor(canvas: HTMLCanvasElement)` | Pobiera 2D context, ustawia rozmiar na window. |
| `clear(): void` | Czyści canvas na początku klatki. |
| `resize(width: number, height: number): void` | Ustawia rozmiar canvasu (wywoływany przy resize window). |
| `readonly ctx: CanvasRenderingContext2D` | Surowy context do rysowania. |
| `readonly width: number` | Aktualna szerokość canvasu. |
| `readonly height: number` | Aktualna wysokość canvasu. |

### `Camera`

```
Plik:       engine/renderer/Camera.ts
Rola:       Pozycja i zoom widoku świata. Transformuje współrzędne świat → ekran.
```

| Metoda / Pole | Opis |
|---|---|
| `position: Vector2` | Pozycja centrum kamery w świecie. |
| `zoom: number` | Poziom zoomu (domyślnie 1.0). |
| `follow(target: Vector2): void` | Ustawia kamerę na cel (np. statek gracza). |
| `worldToScreen(point: Vector2): Vector2` | Przelicza punkt ze świata na ekran. |
| `screenToWorld(point: Vector2): Vector2` | Przelicza punkt z ekranu na świat. |
| `applyTransform(ctx: CanvasRenderingContext2D): void` | Ustawia translate + scale na kontekst 2D. |

### `AudioManager`

```
Plik:       engine/audio/AudioManager.ts
Rola:       Zarządza odtwarzaniem dźwięków. Trzy kanały: music, sfx, ui.
```

| Metoda / Pole | Opis |
|---|---|
| `init(): Promise<void>` | Tworzy AudioContext (po pierwszej interakcji użytkownika). |
| `playMusic(url: string): void` | Odtwarza muzykę (loop, 1 track naraz). |
| `stopMusic(): void` | Zatrzymuje muzykę. |
| `playSfx(url: string): void` | Odtwarza jednorazowy efekt dźwiękowy. |
| `playUiSound(url: string): void` | Odtwarza dźwięk interfejsu. |
| `setVolume(channel: 'music' \| 'sfx' \| 'ui', value: number): void` | Ustawia głośność kanału (0–1). |
| `mute(): void` | Wycisza wszystko. |
| `unmute(): void` | Przywraca głośność. |

### `InputModeManager`

```
Plik:       engine/input/InputModeManager.ts
Rola:       Przełącznik trybu inputu. Jeden aktywny tryb naraz.
```

| Metoda / Pole | Opis |
|---|---|
| `readonly mode: InputMode` | Aktualny tryb: `'game'` \| `'ui'` \| `'locked'`. |
| `setMode(mode: InputMode): void` | Zmienia tryb, emituje event `input-mode-changed`. |
| `onModeChanged(cb: (mode: InputMode) => void): void` | Rejestruje listener. |

### `GameInput`

```
Plik:       engine/input/GameInput.ts
Rola:       Input gry (WASD, strzałki, myszka w świecie). Aktywny tylko w trybie 'game'.
```

| Metoda / Pole | Opis |
|---|---|
| `constructor(canvas: HTMLCanvasElement, modeManager: InputModeManager)` | Binduje listenery na canvas. |
| `isKeyDown(key: string): boolean` | Czy klawisz jest aktualnie wciśnięty. |
| `readonly mouseWorldPos: Vector2` | Pozycja myszy w świecie (wymaga Camera). |
| `onAction(action: string, cb: () => void): void` | Rejestruje callback na akcję (np. `'fire'`, `'boost'`). |
| `update(): void` | Wywoływany co tick — przetwarza bufor zdarzeń. |
| `destroy(): void` | Czyści listenery. |

### `UIInput`

```
Plik:       engine/input/UIInput.ts
Rola:       Input UI (klawisze nawigacji, ESC, Enter). Aktywny tylko w trybie 'ui'.
```

| Metoda / Pole | Opis |
|---|---|
| `constructor(modeManager: InputModeManager)` | Binduje listenery na document. |
| `onNavigate(cb: (direction: 'up' \| 'down' \| 'left' \| 'right') => void): void` | Nawigacja po elementach UI. |
| `onConfirm(cb: () => void): void` | Enter / Space. |
| `onCancel(cb: () => void): void` | Escape. |
| `destroy(): void` | Czyści listenery. |

---

## 3. Specyfikacja pętli gry

### Model: Fixed timestep + variable render

```
┌─────────────── requestAnimationFrame ───────────────┐
│                                                       │
│  accumulator += frameTime                             │
│                                                       │
│  while (accumulator >= TICK_DURATION):                │
│      onFixedUpdate(TICK_DURATION)     ← logika gry   │
│      accumulator -= TICK_DURATION                     │
│                                                       │
│  alpha = accumulator / TICK_DURATION                  │
│  onFrameUpdate(frameTime, alpha)      ← interpolacja │
│  onFrameRender(alpha)                 ← rysowanie    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### Parametry

| Parametr | Wartość | Uwagi |
|---|---|---|
| Tick rate (logika) | 30 tick/s | `TICK_DURATION = 1/30 ≈ 0.0333s` |
| Target FPS (render) | Bez limitu (rAF) | Zależny od monitora, zwykle 60 Hz |
| Max accumulated time | 0.25 s | Zapobiega spiral of death — jeśli accumulator > 0.25s, nadmiar jest odrzucany |
| Clamp frameTime | Min 0.001s, Max 0.25s | Chroni przed zerowym i ekstremalnym dt |

### Kolejność w klatce

1. `requestAnimationFrame` dostarcza timestamp.
2. Oblicz `frameTime = timestamp - lastTimestamp`.
3. Clamp `frameTime` do [0.001, 0.25].
4. Dodaj do `accumulator`.
5. Pętla fixed update (0–N razy).
6. Oblicz `alpha`.
7. `onFrameUpdate(frameTime, alpha)` — aktualizacja prezentacji, animacji, kamery.
8. `onFrameRender(alpha)` — rysowanie klatki.

### Pause / Resume

- `pause()` ustawia flagę. Loop dalej bije (`requestAnimationFrame` nie jest anulowany), ale ciało pętli (update + render) jest pomijane.
- `resume()` zdejmuje flagę i resetuje `lastTimestamp` na aktualny czas, aby uniknąć skoku `frameTime`.
- W stanie `paused` nic się nie rysuje ani nie aktualizuje — ekran zamiera na ostatniej klatce.

---

## 4. Typy startowe (`types/` i `physics/`)

### `types/`

```typescript
// types/common.ts

/** 2D vector. Używany wszędzie: pozycja, prędkość, kierunek. */
export interface Vector2 {
  x: number;
  y: number;
}

/** Identyfikator bytu świata. */
export type EntityId = string;

/** Tryby inputu. */
export type InputMode = 'game' | 'ui' | 'locked';
```

```typescript
// types/engine.ts

import type { Vector2 } from './common';

/** Konfiguracja pętli gry przekazywana do GameLoop. */
export interface GameLoopConfig {
  tickRate: number;                          // tick/s (domyślnie 30)
  onFixedUpdate: (dt: number) => void;
  onFrameUpdate: (dt: number, alpha: number) => void;
  onFrameRender: (alpha: number) => void;
}

/** Minimalny kontrakt obiektu, który może być rysowany. */
export interface Renderable {
  position: Vector2;
  rotation: number;       // radiany
  render(ctx: CanvasRenderingContext2D, alpha: number): void;
}
```

### `physics/`

```typescript
// physics/Vector2.ts

/** Klasa implementująca operacje na Vector2. */
export class Vec2 {
  constructor(public x: number = 0, public y: number = 0) {}

  add(v: Vec2): Vec2       { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v: Vec2): Vec2       { return new Vec2(this.x - v.x, this.y - v.y); }
  scale(s: number): Vec2   { return new Vec2(this.x * s, this.y * s); }
  length(): number         { return Math.sqrt(this.x * this.x + this.y * this.y); }
  normalize(): Vec2 {
    const len = this.length();
    return len > 0 ? this.scale(1 / len) : new Vec2();
  }
  dot(v: Vec2): number     { return this.x * v.x + this.y * v.y; }
  distanceTo(v: Vec2): number { return this.sub(v).length(); }

  static ZERO = new Vec2(0, 0);
}
```

```typescript
// physics/types.ts

import type { Vec2 } from './Vector2';

/** Prostokąt wyrównany do osi (AABB). */
export interface AABB {
  min: Vec2;
  max: Vec2;
}

/** Wynik detekcji kolizji (stub dla Etapu 1). */
export interface CollisionResult {
  collided: boolean;
  normal: Vec2;
  depth: number;
}
```

---

## 5. Konfiguracja toolingu — decyzje

| Parametr | Wartość | Uzasadnienie |
|---|---|---|
| Node.js | >= 20 LTS | Stabilność, wsparcie dla ES modules |
| TypeScript | ~5.5 | Ostatnia stabilna linia z Vite 5/6 |
| Vite | ~5.x (najnowsza 5) | Stabilny, dojrzały, dopuszczalny upgrade na 6 w przyszłości |
| `tsconfig.json` strict | **true** | Eliminuje null/undefined bugs na starcie; łatwiej zacząć strict niż migrowac później |
| `tsconfig.json` target | `ES2020` | Zgodnie z `vite.config.ts` build.target |
| `tsconfig.json` module | `ESNext` | Vite wymaga ES modules |
| `tsconfig.json` moduleResolution | `bundler` | Rekomendowane dla Vite |

### Finalna konfiguracja `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@engine/*": ["src/engine/*"],
      "@physics/*": ["src/physics/*"],
      "@world/*": ["src/world/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### Finalna korekta `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@physics': path.resolve(__dirname, './src/physics'),
      '@world': path.resolve(__dirname, './src/world'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },

  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },

  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

Uwaga: usunięto `@vitejs/plugin-typescript` z pluginów — Vite obsługuje TypeScript natywnie (esbuild). Plugin nie jest potrzebny.

### Korekta do `00_vite-runtime-konfiguracja.md`
- Punkt 4 w „Zachowania brzegowe": zmienić z „TypeScript strict mode — domyślnie OFF" na „TypeScript strict mode — **ON**".

---

## 6. Definicja „done" dla Etapu 1

### Co działa po `npm run dev`

Po uruchomieniu `npm run dev` i otwarciu `http://localhost:5173`:

1. **Czarny canvas na pełnym ekranie** — `#game-layer` jest widoczny, wypełnia viewport, reaguje na resize okna.
2. **Pętla gry bije** — w DevTools console widać log (do usunięcia po weryfikacji): `[GameLoop] tick #N` co ~33ms, plus `[GameLoop] frame` co ~16ms.
3. **Input mode działa** — domyślny tryb `'game'`. Wciśnięcie `Escape` przełącza na `'ui'` (log w konsoli: `[InputMode] → ui`). Ponowne `Escape` wraca na `'game'`.
4. **Kamera istnieje** — Camera ma pozycję (0,0) i zoom 1.0. Strzałki klawiatury (w trybie `game`) przesuwają pozycję kamery (widoczne w logach).
5. **Audio manager gotowy** — `AudioManager.init()` wykonane po pierwszym kliknięciu użytkownika. AudioContext state = `'running'`. Brak odtwarzanego dźwięku (brak assetów — to OK).
6. **Brak błędów** — zero błędów w konsoli. `npm run type-check` przechodzi bez errorów.

### Artefakty zamykające Etap 1

| Artefakt | Stan |
|---|---|
| `index.html` z `#root` + `main.ts` | Gotowy |
| `src/main.ts` → `Bootstrap` → `AppShell` | Działa |
| `AppShell` tworzy 3 warstwy | Widoczne w DOM Inspector |
| `GameLoop` z fixed timestep 30 tick/s | Bije, mierzalne |
| `Renderer` czyści canvas co klatkę | Canvas czarny, nie biały |
| `Camera` z pozycją i zoom | Instancja, transform stosowany |
| `InputModeManager` z 3 trybami | Przełączalny z klawiatury |
| `GameInput` z odczytem klawiszy | Strzałki przesuwają kamerę |
| `UIInput` z ESC/Enter | ESC przełącza tryb |
| `AudioManager` z init na interakcję | AudioContext running |
| `types/common.ts` + `types/engine.ts` | Kompilują się |
| `physics/Vector2.ts` + `physics/types.ts` | Kompilują się |
| `npm run type-check` | 0 errors |
| `npm run build` | Buduje `dist/` bez błędów |

### Czego NIE ma w Etapie 1

- Żadnych obiektów rysowanych na canvas (poza czarnym tłem).
- Żadnego HUD, menu, ekranów.
- Żadnych assetów graficznych ani dźwiękowych.
- Żadnych bytów świata.
- Żadnej logiki gameplayowej.

---

## Podsumowanie zmian do istniejących dokumentów

| Dokument | Zmiana |
|---|---|
| `00_vite-runtime-konfiguracja.md` | Zaktualizować `index.html` — usunąć `#gameCanvas` + `#ui-root`, wstawić `#root`. Zmienić strict mode na ON. Usunąć `@vitejs/plugin-typescript` z vite.config. |
| `01_runtime-engine.md` | Bez zmian treści — ten dokument (`06`) stanowi rozwinięcie kontraktów API. Dodać link: „Szczegółowe kontrakty API: `06_etap1-specyfikacja.md`". |
| `03_ui-dom.md` | Bez zmian — `AppShell` tworzy warstwy zgodnie z opisem w `03`. Niespójność rozwiązana po stronie `00`. |
| `05_plan-prac.md` | Dodać link do definicji done: „Kryteria zamknięcia Etapu 1: `06_etap1-specyfikacja.md`, sekcja 6". |
