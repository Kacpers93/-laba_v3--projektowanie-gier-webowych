# Etap 4 — Specyfikacja: Przygotowanie pierwszych spójnych assetów

## Cel

Dostarczyć minimalny, spójny zestaw assetów graficznych (sprite'y PNG) dla czterech kategorii bytów świata: **ships**, **stations**, **gates**, **celestial**. Zdefiniować manifest assetów, konwencje nazewnicze, reguły mapowania assetów do profili wizualnych oraz rozszerzyć istniejącą warstwę `presentation/` o obsługę źródła `sprite` w `EntityRenderable`.

Po zamknięciu Etapu 4:
- katalog `public/art/` zawiera minimalny pakiet startowy gotowy do użycia,
- `EntityRenderable` obsługuje zarówno `source.type === 'procedural'`, jak i `source.type === 'sprite'`,
- profile wizualne z kategoriami `ship`, `station`, `gate`, `celestial` mogą odwoływać się do sprite'ów z manifestu,
- system ma zdefiniowane fallbacki na wypadek brakujących plików lub błędnych metadanych.

---

## 1. Cel etapu

1. Dostarczyć bazowy zestaw 8 assetów graficznych dla 4 kategorii: ships, stations, gates, celestial.
2. Zdefiniować i wdrożyć manifest assetów (`asset-manifest.json`) — jedyne źródło prawdy o dostępnych zasobach graficznych.
3. Rozszerzyć `EntityRenderable` o pełną obsługę `VisualSource` typu `sprite` (ładowanie obrazu z `AssetLoader` i renderowanie na canvas).
4. Dostarczyć mechanizm ładowania assetów (`AssetLoader`) z obsługą błędów i fallbacków.
5. Zarejestrować profile wizualne oparte na sprite'ach w `VisualProfileRegistry` na podstawie manifestu.
6. Zapewnić, że istniejące mechanizmy (culling, interpolacja, cache, Dev Overlay) działają bez zmian z nowymi assetami.

---

## 2. Założenia i zależności etapu

Etap 4 definiuje kontrakt docelowy dla assetów sprite i ich integracji.
Dokument nie opisuje chwilowego stanu repozytorium, tylko wymagania końcowe.

### Wymagane zależności

| Element | Lokalizacja | Rola |
|---|---|---|
| `VisualProfile` | `presentation/profiles/VisualProfile.ts` | Kontrakt profili wizualnych z `VisualSource` typu `'procedural'` i `'sprite'` |
| `VisualProfileRegistry` | `presentation/profiles/VisualProfileRegistry.ts` | Rejestracja i pobieranie profili po `profileId` |
| `EntityRenderable` | `presentation/renderables/EntityRenderable.ts` | Renderowanie bytów na podstawie profilu |
| `RenderableFactory` | `presentation/renderables/RenderableFactory.ts` | Tworzenie `Renderable` i wiązanie profilu z bytem |
| `OffscreenCache` | `presentation/cache/OffscreenCache.ts` | Cache renderingu proceduralnego |
| `WorldLayer` | `presentation/scene/WorldLayer.ts` | Culling i render listy bytów |
| `AppShell` | `app/AppShell.ts` | Sekwencja startowa oraz integracja loadera i registry |
| Dev Overlay | `dev/DevOverlayPanel.ts` | Prezentacja metryk ładowania assetów |
| Katalog statyczny Vite | `public/` | Serwowanie plików pod ścieżkami runtime `/...` |

---

## 3. Zakres Etapu 4

### Wchodzi w Etap 4

1. Struktura katalogów `public/art/` z 4 podkatalogami.
2. Minimalny zestaw assetów (sprite'y PNG) — dokładnie 8 assetów, po 2 na kategorię.
3. Manifest assetów (`public/art/asset-manifest.json`).
4. `AssetLoader` — preloading obrazów z manifestu.
5. Rozszerzenie `EntityRenderable.render()` o obsługę `source.type === 'sprite'`.
6. Rejestracja profili wizualnych z manifestu w `VisualProfileRegistry`.
7. Integracja z `AppShell` — ładowanie assetów przed startem gry.
8. Fallbacki dla brakujących assetów.
9. Sekcja Assets w Dev Overlay Panel.
10. Walidacja manifestu (runtime).

### NIE wchodzi w Etap 4

- Konkretne klasy bytów (np. `ScoutShip`, `TradingStation`) — to Etap 5.
- Spawn bytów w świecie — to Etap 5.
- Animacje sprite'ów (frame-by-frame) — to Etap 9.
- Atlasy sprite'ów / sprite sheety — to optymalizacja na przyszłość.
- Warianty frakcyjne i uszkodzeniowe — to Etap 9.
- Efekty cząsteczkowe — to Etap 9.
- Assety audio — to Etap 9.
- Assety UI — to Etap 7.

---

## 4. Parametry wejściowe

| Parametr | Wartość | Źródło |
|---|---|---|
| `VisualProfile.source` typ `sprite` | `{ type: 'sprite'; url: string; frameWidth: number; frameHeight: number }` | `VisualProfile.ts` — zdefiniowany w Etapie 3 |
| `EntityCategory` | `'ship' \| 'station' \| 'gate' \| 'celestial'` | `EntityCategory.ts` — Etap 4 dotyczy 4 z 7 kategorii |
| `OffscreenCache` API | `getOrCreate(key, w, h, renderFn)` | Etap 3 / 3.5 — gotowe |
| `VisualProfileRegistry` API | `register(profile)`, `get(profileId)` | Etap 3 — gotowe |
| `RenderableFactory` API | `create(entity, profile)` → `Renderable` | Etap 3 — gotowe |
| Dev Overlay Panel API | `registerSection()`, `registerMetric()` | Etap 3.5 — gotowe |
| Katalog statyczny Vite | `public/` → dostępny pod `/` w runtime | Konfiguracja Vite — Etap 1 |

---

## 5. Parametry wyjściowe

| Parametr | Wartość |
|---|---|
| Wypełniony katalog `public/art/` | Dokładnie 8 plików PNG (po 2 na kategorię) + manifest |
| `asset-manifest.json` | Plik JSON w `public/art/` z listą wszystkich assetów i ich metadanymi |
| `AssetLoader` | Klasa w `presentation/assets/AssetLoader.ts` — preloading i zarządzanie obrazami |
| `AssetManifest` typy | Interfejsy TypeScript w `presentation/assets/assetTypes.ts` |
| Rozszerzony `EntityRenderable` | Obsługa `source.type === 'sprite'` w `render()` |
| Profile wizualne sprite'ów | Zarejestrowane w `VisualProfileRegistry` na podstawie manifestu |
| Sekcja Assets w Dev Overlay | Metryki: załadowane/łącznie, błędy ładowania |

---

## 6. Zachowanie brzegowe

### Brakujący plik sprite'a

Jeśli plik PNG nie istnieje pod URL-em podanym w manifeście:
1. `AssetLoader` loguje ostrzeżenie: `[AssetLoader] Failed to load: /art/ships/scout-mk1.png`.
2. `AssetLoader` zwraca `null` zamiast `HTMLImageElement`.
3. `EntityRenderable` rysuje **fallback proceduralny** — kolorowy prostokąt z napisem kategorii (np. czerwony prostokąt z tekstem "SHIP").
4. Gra się nie zatrzymuje — brak assetu nie jest błędem krytycznym.

### Uszkodzony plik PNG

Zachowanie identyczne jak przy brakującym pliku — `Image.onerror` traktowany jak brak pliku.

### Manifest nie istnieje lub jest niepoprawny

1. Jeśli `asset-manifest.json` nie istnieje: `AssetLoader` loguje błąd i zwraca pusty zestaw assetów. Profile wizualne pozostają proceduralne (dev).
2. Jeśli manifest jest niepoprawnym JSON-em: jak wyżej.
3. Jeśli manifest przechodzi parsowanie, ale wpis nie spełnia schematu: wpis jest pomijany z ostrzeżeniem. Pozostałe wpisy ładowane normalnie.

### Zduplikowany `assetId` w manifeście

Zduplikowany `assetId` nie zatrzymuje gry.
Walidacja manifestu pomija drugi i każdy kolejny wpis z tym samym `assetId` oraz loguje ostrzeżenie.
Po walidacji manifest przekazywany do rejestracji profili nie zawiera duplikatów.

### Rozmiar sprite'a niezgodny z `frameWidth`/`frameHeight`

Jeśli rzeczywisty rozmiar załadowanego obrazu różni się od deklarowanego w manifeście o więcej niż 2 px w dowolnym wymiarze: logowane jest ostrzeżenie. Obraz jest nadal używany — rysowany w deklarowanym rozmiarze (skalowanie).

### Zerowy lub ujemny rozmiar w manifeście

Wpis jest odrzucany z ostrzeżeniem. Nie trafia do registry.

---

## 7. Struktura katalogów i nazewnictwo assetów

### Struktura `public/art/`

```
public/art/
├── asset-manifest.json          ← manifest — jedyne źródło prawdy
├── ships/
│   ├── scout-mk1.png            ← sprite'y statków
│   ├── freighter-standard.png
│   └── README.md                ← opis kategorii (opcjonalny)
├── stations/
│   ├── trading-outpost.png      ← sprite'y stacji
│   ├── mining-platform.png
│   └── README.md
├── gates/
│   ├── stargate-standard.png    ← sprite'y wrót
│   ├── jumpgate-ancient.png
│   └── README.md
└── celestial/
    ├── planet-terran.png         ← sprite'y ciał niebieskich
    ├── asteroid-rocky.png
    └── README.md
```

### Konwencja nazewnicza plików

| Reguła | Przykład |
|---|---|
| Tylko małe litery (lowercase) | `scout-mk1.png` ✅, `Scout-Mk1.png` ❌ |
| Separator: myślnik (`-`) | `trading-outpost.png` ✅, `trading_outpost.png` ❌ |
| Format: `<typ>-<wariant>.png` | `freighter-standard.png`, `planet-terran.png` |
| Rozszerzenie: `.png` (RGBA, przezroczyste tło) | Wyłącznie PNG z kanałem alpha |
| Brak spacji, polskich znaków, wielkich liter | Wymagane |
| Nazwa unikalna globalnie w obrębie kategorii | Nie mogą istnieć dwa `scout-mk1.png` w `ships/` |

### Konwencja nazewnicza folderów

| Reguła | Przykład |
|---|---|
| Nazwa folderu = liczba mnoga kategorii w `EntityCategory` | `ships/` ← category `'ship'` |
| Mapowanie: `ship` → `ships/`, `station` → `stations/`, `gate` → `gates/`, `celestial` → `celestial/` | `celestial` pozostaje bez zmian (jest już w liczbie odpowiedniej) |

### Mapowanie `EntityCategory` → folder

```typescript
const CATEGORY_TO_FOLDER: Record<string, string> = {
  ship: 'ships',
  station: 'stations',
  gate: 'gates',
  celestial: 'celestial',
};
```

---

## 8. Kontrakty danych assetów

### Manifest: `asset-manifest.json`

```typescript
// presentation/assets/assetTypes.ts

/** Pojedynczy wpis assetu w manifeście. */
export interface AssetManifestEntry {
  /** Unikalny identyfikator assetu — staje się profileId w VisualProfileRegistry. */
  assetId: string;

  /** Kategoria bytu (musi odpowiadać EntityCategory). */
  category: 'ship' | 'station' | 'gate' | 'celestial';

  /** Ścieżka do pliku PNG względem roota serwera (np. '/art/ships/scout-mk1.png'). */
  url: string;

  /** Szerokość klatki sprite'a w pikselach. */
  frameWidth: number;

  /** Wysokość klatki sprite'a w pikselach. */
  frameHeight: number;

  /** Rozmiar wizualny obiektu w pikselach świata (do renderowania). */
  worldSize: {
    width: number;
    height: number;
  };

  /** Promień do frustum culling (px świata). */
  cullRadius: number;

  /** Wersja assetu — do inwalidacji cache. Format: integer >= 1. */
  version: number;

  /** Opcjonalne tagi do grupowania i filtrowania. */
  tags?: string[];
}

/** Pełny manifest assetów. */
export interface AssetManifest {
  /** Wersja schematu manifestu. */
  schemaVersion: 1;

  /** Timestamp ostatniej aktualizacji manifestu (ISO 8601). */
  updatedAt: string;

  /** Lista assetów. */
  assets: AssetManifestEntry[];
}
```

### Reguły manifestu

1. Pole `assetId` jest unikalne w obrębie całego manifestu.
2. Pole `url` musi zaczynać się od `/art/` i kończyć na `.png`.
3. Pola `frameWidth`, `frameHeight`, `worldSize.width`, `worldSize.height`, `cullRadius` muszą być > 0.
4. Pole `version` musi być liczbą całkowitą >= 1.
5. Pole `category` musi odpowiadać jednej z obsługiwanych kategorii (`ship`, `station`, `gate`, `celestial`).
6. Pole `tags` jest opcjonalne. Jeśli podane, musi być tablicą stringów.

### Przykładowy `asset-manifest.json`

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-04-06T18:00:00Z",
  "assets": [
    {
      "assetId": "scout-mk1",
      "category": "ship",
      "url": "/art/ships/scout-mk1.png",
      "frameWidth": 64,
      "frameHeight": 40,
      "worldSize": { "width": 48, "height": 30 },
      "cullRadius": 32,
      "version": 1,
      "tags": ["light", "combat"]
    },
    {
      "assetId": "freighter-standard",
      "category": "ship",
      "url": "/art/ships/freighter-standard.png",
      "frameWidth": 96,
      "frameHeight": 64,
      "worldSize": { "width": 72, "height": 48 },
      "cullRadius": 50,
      "version": 1,
      "tags": ["heavy", "cargo"]
    },
    {
      "assetId": "trading-outpost",
      "category": "station",
      "url": "/art/stations/trading-outpost.png",
      "frameWidth": 128,
      "frameHeight": 128,
      "worldSize": { "width": 96, "height": 96 },
      "cullRadius": 72,
      "version": 1,
      "tags": ["commerce"]
    },
    {
      "assetId": "mining-platform",
      "category": "station",
      "url": "/art/stations/mining-platform.png",
      "frameWidth": 112,
      "frameHeight": 96,
      "worldSize": { "width": 84, "height": 72 },
      "cullRadius": 64,
      "version": 1,
      "tags": ["industrial"]
    },
    {
      "assetId": "stargate-standard",
      "category": "gate",
      "url": "/art/gates/stargate-standard.png",
      "frameWidth": 80,
      "frameHeight": 96,
      "worldSize": { "width": 60, "height": 72 },
      "cullRadius": 56,
      "version": 1,
      "tags": ["standard"]
    },
    {
      "assetId": "jumpgate-ancient",
      "category": "gate",
      "url": "/art/gates/jumpgate-ancient.png",
      "frameWidth": 96,
      "frameHeight": 112,
      "worldSize": { "width": 72, "height": 84 },
      "cullRadius": 64,
      "version": 1,
      "tags": ["ancient", "rare"]
    },
    {
      "assetId": "planet-terran",
      "category": "celestial",
      "url": "/art/celestial/planet-terran.png",
      "frameWidth": 256,
      "frameHeight": 256,
      "worldSize": { "width": 200, "height": 200 },
      "cullRadius": 140,
      "version": 1,
      "tags": ["planet", "habitable"]
    },
    {
      "assetId": "asteroid-rocky",
      "category": "celestial",
      "url": "/art/celestial/asteroid-rocky.png",
      "frameWidth": 48,
      "frameHeight": 48,
      "worldSize": { "width": 36, "height": 36 },
      "cullRadius": 26,
      "version": 1,
      "tags": ["asteroid", "mineable"]
    }
  ]
}
```

---

## 9. Integracja z warstwą presentation i profile registry

### `AssetLoader` — ładowanie assetów

```typescript
// presentation/assets/AssetLoader.ts

import type { AssetManifest, AssetManifestEntry } from './assetTypes';

/**
 * Ładuje assety graficzne na podstawie manifestu.
 * Preloaduje obrazy przed startem gry. Obsługuje fallbacki.
 */
export class AssetLoader {
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly failedAssets = new Set<string>();
  private manifest: AssetManifest | null = null;

  /** Ładuje manifest z podanego URL. */
  async loadManifest(url: string): Promise<AssetManifest | null>;

  /** Preloaduje wszystkie obrazy z manifestu. Zwraca po zakończeniu ładowania. */
  async preloadAll(): Promise<void>;

  /** Pobiera załadowany obraz po assetId. null jeśli nie załadowano. */
  getImage(assetId: string): HTMLImageElement | null;

  /** Czy asset się załadował poprawnie. */
  isLoaded(assetId: string): boolean;

  /** Czy asset nie załadował się (błąd). */
  isFailed(assetId: string): boolean;

  /** Załadowany manifest (null jeśli nie załadowano). */
  getManifest(): AssetManifest | null;

  /** Statystyki ładowania. */
  get stats(): { total: number; loaded: number; failed: number };
}
```

#### Szczegóły implementacji

1. `loadManifest(url)` wykonuje `fetch(url)`, parsuje JSON i waliduje schemat. Zwraca `null` przy błędach krytycznych.
  - Poziom `error`: brak pliku manifestu, błąd `fetch`, błąd parsowania JSON, nieobsługiwany `schemaVersion`.
  - Poziom `warn`: odrzucony pojedynczy wpis manifestu, zduplikowany `assetId`, błąd ładowania pojedynczego obrazu.
2. `preloadAll()` iteruje po `manifest.assets`, tworzy `new Image()`, ustawia `src`, czeka na `onload`/`onerror` przez `Promise`. Ładowanie jest równoległe (`Promise.allSettled`).
3. Obrazy trzymane w `Map<assetId, HTMLImageElement>` — nie w `OffscreenCache`. `OffscreenCache` służy do cache'owania wyrenderowanych klatek, nie surowych obrazów.
4. Błąd ładowania pojedynczego obrazu nie blokuje pozostałych. Status jest zapisywany w `failedAssets`.

### Rozszerzenie `EntityRenderable.render()` — obsługa sprite'ów

Obecny kod `EntityRenderable.render()` obsługuje wyłącznie blok `if (source.type === 'procedural')`. Dodać blok `else if (source.type === 'sprite')`:

```typescript
// W EntityRenderable.render():

if (source.type === 'procedural') {
  // ... istniejący kod bez zmian ...
} else if (source.type === 'sprite') {
  const image = this.assetLoader.getImage(this.profile.profileId);

  if (!image) {
    // Fallback: kolorowy prostokąt z nazwą kategorii
    this.renderFallback(ctx);
  } else {
    const { width, height } = this.profile.size;
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
  }
}
```

#### Zmiana konstruktora `EntityRenderable`

`EntityRenderable` potrzebuje referencji do `AssetLoader` dla trybu sprite. Dodać opcjonalny parametr:

```typescript
public constructor(
  public readonly entityId: EntityId,
  private readonly profile: VisualProfile,
  private readonly cache: OffscreenCache,
  private readonly assetLoader?: AssetLoader,
)
```

`RenderableFactory` przekazuje `AssetLoader` do `EntityRenderable`.

#### Zmiana `RenderableFactory`

```typescript
export class RenderableFactory {
  public constructor(
    private readonly cache: OffscreenCache,
    private readonly assetLoader?: AssetLoader,
  ) {}

  public create(entity: GameEntity, profile: VisualProfile): Renderable {
    const renderable = new EntityRenderable(entity.id, profile, this.cache, this.assetLoader);
    renderable.syncFromEntity(entity);
    return renderable;
  }
}
```

> **Uwaga:** Dodanie `assetLoader` jako opcjonalnego parametru zachowuje kompatybilność wsteczną. Istniejący kod bez `AssetLoader` działa identycznie jak dotychczas.

### Fallback proceduralny

Metoda `renderFallback(ctx)` w `EntityRenderable`:

```typescript
private renderFallback(ctx: CanvasRenderingContext2D): void {
  const { width, height } = this.profile.size;
  ctx.fillStyle = '#ff2244';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.globalAlpha = 1.0;

  ctx.fillStyle = '#ffffff';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(this.profile.category.toUpperCase(), 0, 0);
}
```

### Rejestracja profili z manifestu

Nowa funkcja rejestrująca profile na podstawie załadowanego manifestu:

```typescript
// presentation/assets/registerManifestProfiles.ts

import type { AssetManifest } from './assetTypes';
import type { VisualProfileRegistry } from '@presentation/profiles/VisualProfileRegistry';
import type { VisualProfile } from '@presentation/profiles/VisualProfile';

/**
 * Rejestruje profile wizualne w registry na podstawie manifestu assetów.
 * Zakłada unikalne `assetId` po `validateManifest`.
 * Jeśli `profileId` już istnieje w registry, wpis jest pomijany z ostrzeżeniem.
 */
export function registerManifestProfiles(
  manifest: AssetManifest,
  registry: VisualProfileRegistry,
): void {
  for (const entry of manifest.assets) {
    if (registry.has(entry.assetId)) {
      console.warn(`[registerManifestProfiles] Profile already registered: ${entry.assetId}, skipping.`);
      continue;
    }

    const profile: VisualProfile = {
      profileId: entry.assetId,
      category: entry.category,
      size: { width: entry.worldSize.width, height: entry.worldSize.height },
      cullRadius: entry.cullRadius,
      source: {
        type: 'sprite',
        url: entry.url,
        frameWidth: entry.frameWidth,
        frameHeight: entry.frameHeight,
      },
    };

    registry.register(profile);
  }
}
```

### Integracja z `AppShell`

Zmiana sekwencji startowej w `AppShell`:

1. `AppShell.constructor()`:
   - Tworzy `AssetLoader`.
   - Tworzy `RenderableFactory(cache, assetLoader)` (zamiast `RenderableFactory(cache)`).

2. `AppShell.start()`:
   - Przed uruchomieniem `gameLoop.start()`: ładuje manifest i preloaduje assety.
   - Po załadowaniu: rejestruje profile z manifestu.
   - Dopiero wtedy: uruchamia pętlę gry.

```typescript
public async start(): Promise<void> {
  if (this.started) return;
  this.started = true;

  // Ładowanie assetów
  const manifest = await this.assetLoader.loadManifest('/art/asset-manifest.json');
  if (manifest) {
    await this.assetLoader.preloadAll();
    registerManifestProfiles(manifest, this.visualProfileRegistry);
  }

  this.canvas.focus();
  this.gameLoop.start();
}
```

> **Uwaga:** `AppShell.start()` zmienia sygnaturę z `void` na `Promise<void>`. Wymaga aktualizacji `Bootstrap.ts`: `await appShell.start()`.

### Sekcja Assets w Dev Overlay Panel

Nowa sekcja w Dev Overlay:

| Metryka | Getter | Format |
|---|---|---|
| `loaded` | `assetLoader.stats.loaded` | liczba |
| `total` | `assetLoader.stats.total` | liczba |
| `failed` | `assetLoader.stats.failed` | liczba |

Rejestracja:

```typescript
const assetsSection = overlay.registerSection('assets', 'Assets');
assetsSection.registerMetric('loaded', 'loaded', () => this.assetLoader.stats.loaded);
assetsSection.registerMetric('total', 'total', () => this.assetLoader.stats.total);
assetsSection.registerMetric('failed', 'failed', () => this.assetLoader.stats.failed);
```

### Sekcja Sprite Test w Dev Overlay Panel

Do szybkiej weryfikacji sprite'ów dodajemy mały panel testowy w Dev Overlay:

| Kontrola / metryka | Cel |
|---|---|
| `active` | pokazuje aktualnie aktywny `assetId` testowego sprite'a |
| `available` | liczba zarejestrowanych profili sprite'owych |
| `Spawn next sprite` | przełącza testowy byt na kolejny sprite z manifestu |
| `Clear sprite test` | usuwa testowy byt ze sceny |

Panel ma służyć tylko do ręcznej weryfikacji assetów po `npm run dev`.

---

## 10. Walidacja i kontrola jakości assetów

### Walidacja manifestu (runtime)

`AssetLoader.loadManifest()` waliduje manifest przy ładowaniu:

| Reguła | Akcja przy naruszeniu |
|---|---|
| `schemaVersion !== 1` | Odrzucenie manifestu z błędem |
| Brak pola `assets` lub nie jest tablicą | Odrzucenie manifestu z błędem |
| `assetId` pusty lub nie-string | Pominięcie wpisu z ostrzeżeniem |
| `category` spoza dozwolonych | Pominięcie wpisu z ostrzeżeniem |
| `url` nie zaczyna się od `/art/` | Pominięcie wpisu z ostrzeżeniem |
| `url` nie kończy się na `.png` | Pominięcie wpisu z ostrzeżeniem |
| `frameWidth <= 0` lub `frameHeight <= 0` | Pominięcie wpisu z ostrzeżeniem |
| `worldSize.width <= 0` lub `worldSize.height <= 0` | Pominięcie wpisu z ostrzeżeniem |
| `cullRadius <= 0` | Pominięcie wpisu z ostrzeżeniem |
| `version` nie jest liczbą >= 1 | Pominięcie wpisu z ostrzeżeniem |
| Zduplikowany `assetId` | Pominięcie drugiego wpisu z ostrzeżeniem |

Funkcja walidująca:

```typescript
// presentation/assets/validateManifest.ts

import type { AssetManifest, AssetManifestEntry } from './assetTypes';

const VALID_CATEGORIES = new Set(['ship', 'station', 'gate', 'celestial']);

/**
 * Waliduje manifest i zwraca przefiltrowaną kopię z poprawnymi wpisami.
 * Loguje ostrzeżenia dla odrzuconych wpisów.
 */
export function validateManifest(raw: unknown): AssetManifest | null;
```

### Wymagania jakościowe plików PNG

| Parametr | Wymaganie |
|---|---|
| Format | PNG z kanałem alpha (RGBA) |
| Tło | Przezroczyste (alpha = 0) |
| Orientacja | Obiekt zwrócony w prawo (rotation = 0 oznacza lot/skierowanie w prawo) |
| Rozmiar pliku | Maksymalnie 256 KB per plik (dla małych sprite'ów 64×64 typowo < 10 KB) |
| Rozmiar obrazu | Zgodny z `frameWidth` × `frameHeight` w manifeście (tolerancja ±2 px) |
| Kolory | Spójna paleta kosmiczna — brak jaskrawych, neonowych kolorów bez uzasadnienia |
| Antyaliasing | Krawędzie wygładzone — brak jaggies widocznych przy zoom 1.0 |
| Centrowanie | Obiekt wizualnie wycentrowany w obrębie ramki sprite'a |

---

## 11. Definition of done i kryteria odbioru

### Co działa po `npm run dev`

Po uruchomieniu `npm run dev` i otwarciu `http://localhost:5173`:

1. **Assety załadowane** — Dev Overlay, sekcja Assets, pokazuje `loaded: 8`, `total: 8`, `failed: 0`.
2. **Manifest poprawny** — brak ostrzeżeń walidacji manifestu w konsoli.
3. **Profile zarejestrowane** — `visualProfileRegistry.getAll()` zawiera 8 profili sprite'owych (+ dev proceduralny).
4. **Test byt proceduralny działa** — istniejący test byt (trójkąt) renderuje się bez zmian.
5. **Sprite rendering działa** — po ręcznym dodaniu bytu ze sprite'owym profilem (przez konsolę lub przyszły kod Etapu 5) obraz wyświetla się poprawnie z przezroczystym tłem.
6. **Fallback działa** — celowe podanie nieistniejącego URL-a w manifeście powoduje wyświetlenie czerwonego prostokąta z nazwą kategorii.
7. **Culling działa ze sprite'ami** — sprite'y poza frustum nie są rysowane.
8. **Interpolacja działa ze sprite'ami** — sprite'y z niezerową prędkością poruszają się płynnie.
9. **Cache działa** — profile proceduralne korzystają z `OffscreenCache`, a profile sprite korzystają z `AssetLoader` i nie przechowują surowych obrazów w `OffscreenCache`.
10. **Brak błędów** — zero błędów w konsoli. `npm run type-check` przechodzi. `npm run build` buduje bez błędów.

### Artefakty wymagane do zamknięcia Etapu 4

| Artefakt | Stan |
|---|---|
| `public/art/asset-manifest.json` — manifest | Gotowy, 8 wpisów |
| `public/art/ships/scout-mk1.png` | Gotowy |
| `public/art/ships/freighter-standard.png` | Gotowy |
| `public/art/stations/trading-outpost.png` | Gotowy |
| `public/art/stations/mining-platform.png` | Gotowy |
| `public/art/gates/stargate-standard.png` | Gotowy |
| `public/art/gates/jumpgate-ancient.png` | Gotowy |
| `public/art/celestial/planet-terran.png` | Gotowy |
| `public/art/celestial/asteroid-rocky.png` | Gotowy |
| `presentation/assets/assetTypes.ts` — typy | Gotowy |
| `presentation/assets/AssetLoader.ts` — loader | Gotowy |
| `presentation/assets/validateManifest.ts` — walidacja | Gotowy |
| `presentation/assets/registerManifestProfiles.ts` — rejestracja | Gotowy |
| `presentation/assets/index.ts` — re-eksport | Gotowy |
| `presentation/renderables/EntityRenderable.ts` — rozszerzony o sprite | Gotowy |
| `presentation/renderables/RenderableFactory.ts` — rozszerzony o AssetLoader | Gotowy |
| `app/AppShell.ts` — integracja loadera | Gotowy |
| `app/Bootstrap.ts` — `await start()` | Gotowy |
| `npm run type-check` | 0 errors |
| `npm run build` | Buduje bez błędów |

### Czego NIE ma w Etapie 4

- Żadnych konkretnych klas bytów (TypeScript) — tylko assety i profile.
- Żadnych bytów osadzonych automatycznie w świecie — osadzanie to Etap 5.
- Żadnych animacji sprite'ów (frame-by-frame).
- Żadnych atlasów/sprite sheetów.
- Żadnych wariantów frakcyjnych.
- Żadnych efektów (cząstki, wybuchy, ślady silników).
- Żadnych assetów audio.

---

## 12. Ryzyka i luki

| # | Ryzyko / Luka | Opis | Mitygacja |
|---|---|---|---|
| R1 | Rozmiar sprite'ów a wydajność | Sprite'y ciał niebieskich (256×256) są duże i mogą obciążać pamięć GPU przy wielu instancjach. | W Etapie 4 maksymalnie kilka ciał niebieskich na scenę. Optymalizacja (atlasy, LOD) w przyszłych etapach. |
| R2 | Brak walidacji offline manifestu | Manifest walidowany jest wyłącznie w runtime. Literówka w URL-u zostanie wykryta dopiero po uruchomieniu gry. | Dodanie skryptu CLI walidującego manifest jest kandydatem na backlog. W Etapie 4 manifest jest mały (8 wpisów) — weryfikacja ręczna jest wystarczająca. |
| R3 | `AppShell.start()` zmienia sygnaturę | Zmiana z `void` na `Promise<void>` jest zmianą kontraktu. `Bootstrap.ts` wymaga aktualizacji. | Zmiana jest izolowana do jednego wywołania w `Bootstrap.ts`. |
| R4 | Brak testów A/B stylów graficznych | Sprite'y mogą nie pasować wizualnie do proceduralnej paralaksy i tła. | Iteracja w ramach Etapu 4 — korygowanie kolorystyki po pierwszej integracji. |
| R5 | `VisualSource.sprite.url` jest relatywny do roota serwera | URL `/art/ships/scout-mk1.png` działa w Vite dev server, ale może wymagać korekty w produkcji z `base` path. | Vite obsługuje `base` w konfiguracji. URL-e z `/` od roota działają poprawnie z domyślną konfiguracją `base: '/'`. |
| R6 | Brak mechanizmu hot-reload assetów | Zmiana PNG wymaga przeładowania strony. | Hot-reload assetów nie wchodzi w scope Etapu 4. Standardowe zachowanie Vite (HMR na kodzie, przeładowanie na plikach `public/`) jest wystarczające. |
| R7 | `EntityRenderable` wymaga `assetLoader` dla sprite'ów | Dodanie opcjonalnego parametru do konstruktora narusza nieco zasadę minimalnego interfejsu. | Parametr jest opcjonalny — istniejący kod bez `AssetLoader` działa bez zmian. Alternatywa (osobna klasa `SpriteRenderable`) została odrzucona na rzecz prostoty. |
| R8 | Nieprecyzyjny kontrakt orientacji sprite'a | „Zwrócony w prawo" może być interpretowane różnie. | Konwencja: rotation = 0 → obiekt z „nosem" / „frontem" wskazującym w prawo (kierunek +X w układzie canvas). Stacje i planety nie mają orientacji frontalnej — ignorują tę regułę. |

---

## 13. Plan wdrożenia krok po kroku

```
Krok 1: Typy manifestu
         presentation/assets/assetTypes.ts
         ↓
Krok 2: Walidacja manifestu
         presentation/assets/validateManifest.ts
         ↓
Krok 3: AssetLoader
         presentation/assets/AssetLoader.ts
         ↓
Krok 4: Rejestracja profili z manifestu
         presentation/assets/registerManifestProfiles.ts
         ↓
Krok 5: Re-eksport
         presentation/assets/index.ts
         ↓
Krok 6: Rozszerzenie EntityRenderable o obsługę sprite + fallback
         presentation/renderables/EntityRenderable.ts
         ↓
Krok 7: Rozszerzenie RenderableFactory o AssetLoader
         presentation/renderables/RenderableFactory.ts
         ↓
Krok 8: Struktura katalogów w public/art/
         Utworzenie: ships/, stations/, gates/, celestial/
         ↓
Krok 9: Generacja / przygotowanie sprite'ów PNG (8 plików)
         Sprites w art style pasującym do kosmicznej paralaksy
         ↓
Krok 10: Manifest assetów
          public/art/asset-manifest.json
          ↓
Krok 11: Integracja z AppShell
          - Utworzenie AssetLoader w konstruktorze
          - Aktualizacja RenderableFactory
          - Zmiana start() na async + ładowanie manifestu + preload
          - Rejestracja profili z manifestu
          - Sekcja Assets w Dev Overlay
          ↓
Krok 12: Aktualizacja Bootstrap.ts
          - await appShell.start()
          ↓
Krok 13: Konfiguracja aliasu @assets
          tsconfig.json i vite.config.ts:
          "@assets/*": ["./src/presentation/assets/*"]
          ↓
Krok 14: Weryfikacja ręczna
          - npm run dev — brak błędów, manifest załadowany, sekcja Assets w panelu
          - Ręczne dodanie bytu ze sprite'owym profilem — obraz się renderuje
          - Celowy błąd URL — fallback się renderuje
          - npm run type-check — 0 errors
          - npm run build — buduje bez błędów
```

### Szczegóły zadań implementacyjnych

#### T1. Typy manifestu
- Utworzyć `presentation/assets/assetTypes.ts`.
- Zdefiniować `AssetManifestEntry`, `AssetManifest`.

#### T2. Walidacja manifestu
- Utworzyć `presentation/assets/validateManifest.ts`.
- Funkcja `validateManifest(raw: unknown): AssetManifest | null`.
- Walidacja `schemaVersion`, pól wpisów, duplikatów `assetId`.

#### T3. AssetLoader
- Utworzyć `presentation/assets/AssetLoader.ts`.
- Metody: `loadManifest()`, `preloadAll()`, `getImage()`, `isLoaded()`, `isFailed()`, `stats`.
- Ładowanie `Image` z `Promise.allSettled`.

#### T4. Rejestracja profili
- Utworzyć `presentation/assets/registerManifestProfiles.ts`.
- Funkcja `registerManifestProfiles(manifest, registry)`.
- Tworzenie `VisualProfile` z `source.type === 'sprite'` na podstawie wpisu manifestu.

#### T5. Re-eksport
- Utworzyć `presentation/assets/index.ts`.

#### T6. Rozszerzenie `EntityRenderable`
- Dodać opcjonalny czwarty parametr konstruktora: `assetLoader?: AssetLoader`.
- Dodać blok `else if (source.type === 'sprite')` w `render()`.
- Dodać metodę prywatną `renderFallback(ctx)`.

#### T7. Rozszerzenie `RenderableFactory`
- Dodać opcjonalny parametr: `assetLoader?: AssetLoader`.
- Przekazywać `assetLoader` do `EntityRenderable`.

#### T8. Struktura katalogów
- Utworzyć katalogi: `public/art/ships/`, `public/art/stations/`, `public/art/gates/`, `public/art/celestial/`.

#### T9. Sprite'y PNG
- Przygotować 8 plików PNG:
  - `ships/scout-mk1.png` (64×40) — mały, szybki statek zwiadowczy
  - `ships/freighter-standard.png` (96×64) — duży statek transportowy
  - `stations/trading-outpost.png` (128×128) — stacja handlowa
  - `stations/mining-platform.png` (112×96) — platforma wydobywcza
  - `gates/stargate-standard.png` (80×96) — standardowa brama gwiezdna
  - `gates/jumpgate-ancient.png` (96×112) — starożytna brama skoku
  - `celestial/planet-terran.png` (256×256) — planeta typu ziemskiego
  - `celestial/asteroid-rocky.png` (48×48) — asteroida skalista
- Przezroczyste tło, kolorystyka kosmiczna, statki zwrócone w prawo.

#### T10. Manifest
- Utworzyć `public/art/asset-manifest.json` z 8 wpisami.

#### T11. Integracja AppShell
- Utworzyć `AssetLoader` w konstruktorze.
- Zmienić `RenderableFactory(cache)` na `RenderableFactory(cache, assetLoader)`.
- Zmienić `start()` na `async start(): Promise<void>`.
- W `start()`: `loadManifest` → `preloadAll` → `registerManifestProfiles`.
- Dodać sekcję Assets w Dev Overlay.

#### T12. Bootstrap
- Zmienić `appShell.start()` na `await appShell.start()`.

#### T13. Alias
- Dodać `@assets` do `tsconfig.json` i `vite.config.ts`.

#### T14. Weryfikacja ręczna
- `npm run dev` — brak błędów konsoli.
- Dev Overlay, sekcja Assets: `loaded: 8`, `total: 8`, `failed: 0`.
- `npm run type-check` — 0 errors.
- `npm run build` — buduje bez błędów.

---

## Reguły wersjonowania i aktualizacji assetów

### Wersjonowanie

1. Każdy wpis manifestu ma pole `version: number` (integer >= 1).
2. Aktualizacja sprite'a wymaga inkrementacji `version` w odpowiednim wpisie manifestu.
3. Pole `version` służy do przyszłej inwalidacji cache — w Etapie 4 nie jest aktywnie używane przez runtime, ale jest wymagane w schemacie.
4. Pole `updatedAt` w manifeście wskazuje datę ostatniej modyfikacji manifestu (ISO 8601).

### Procedura aktualizacji assetu

1. Zastąpić plik PNG nową wersją (ta sama nazwa, ta sama lokalizacja).
2. Zaktualizować `version` w odpowiednim wpisie manifestu (np. `1 → 2`).
3. Zaktualizować `updatedAt` w manifeście.
4. Jeśli zmienił się rozmiar sprite'a: zaktualizować `frameWidth`, `frameHeight`, `worldSize`, `cullRadius`.
5. Uruchomić `npm run dev` i zweryfikować wizualnie.

### Dodawanie nowego assetu

1. Dodać plik PNG do odpowiedniego podkatalogu (`ships/`, `stations/`, `gates/`, `celestial/`).
2. Dodać nowy wpis do tablicy `assets` w manifeście.
3. Zaktualizować `updatedAt`.
4. Upewnić się, że `assetId` jest unikalny.

### Usuwanie assetu

1. Usunąć wpis z tablicy `assets` w manifeście.
2. Usunąć plik PNG z katalogu.
3. Zaktualizować `updatedAt`.
4. Upewnić się, że żaden profil w kodzie nie odwołuje się do usuniętego `assetId`.

---

## Minimalny zestaw assetów — definicja

### Kategoria: ships (statki)

| assetId | Plik | Rozmiar klatki | Rozmiar świata | Opis |
|---|---|---|---|---|
| `scout-mk1` | `ships/scout-mk1.png` | 64×40 | 48×30 | Mały statek zwiadowczy — trójkątny kształt, szybki, lekko opancerzony |
| `freighter-standard` | `ships/freighter-standard.png` | 96×64 | 72×48 | Duży statek transportowy — masywny kadłub, wolny, dużo cargo |

### Kategoria: stations (stacje)

| assetId | Plik | Rozmiar klatki | Rozmiar świata | Opis |
|---|---|---|---|---|
| `trading-outpost` | `stations/trading-outpost.png` | 128×128 | 96×96 | Stacja handlowa — symetryczna, z dokami |
| `mining-platform` | `stations/mining-platform.png` | 112×96 | 84×72 | Platforma wydobywcza — asymetryczna, z wiertłami/chwytakami |

### Kategoria: gates (wrota)

| assetId | Plik | Rozmiar klatki | Rozmiar świata | Opis |
|---|---|---|---|---|
| `stargate-standard` | `gates/stargate-standard.png` | 80×96 | 60×72 | Standardowa brama gwiezdna — okrągły lub owalny portal |
| `jumpgate-ancient` | `gates/jumpgate-ancient.png` | 96×112 | 72×84 | Starożytna brama — ozdobna ramka, świecący rdzeń |

### Kategoria: celestial (ciała niebieskie)

| assetId | Plik | Rozmiar klatki | Rozmiar świata | Opis |
|---|---|---|---|---|
| `planet-terran` | `celestial/planet-terran.png` | 256×256 | 200×200 | Planeta ziemska — niebiesko-zielona, z atmosferą |
| `asteroid-rocky` | `celestial/asteroid-rocky.png` | 48×48 | 36×36 | Asteroida skalista — szaro-brązowa, nieregularny kształt |

---

## Checklista testów

### Testy ręczne

| # | Test | Oczekiwany wynik |
|---|---|---|
| M1 | Uruchom `npm run dev`, otwórz konsolę — brak błędów i ostrzeżeń walidacji manifestu | Konsola czysta |
| M2 | Dev Overlay, sekcja Assets: wartości `loaded`, `total`, `failed` | `loaded: 8`, `total: 8`, `failed: 0` |
| M3 | Ręcznie dodaj byt ze sprite'owym profilem przez `__dev` w konsoli | Sprite renderuje się na canvasie |
| M4 | Zmień URL w manifeście na nieistniejący plik, przeładuj stronę | Czerwony prostokąt z napisem kategorii zamiast sprite'a |
| M5 | Przesuń kamerę daleko od sprite'owego bytu | Sprite znika (culling), `lastCulledCount` wzrasta |
| M6 | Wróć kamerą do bytu | Sprite pojawia się ponownie |
| M7 | Zmień rozmiar okna przeglądarki | Brak artefaktów, sprite dalej renderuje się poprawnie |
| M8 | Uruchom `npm run build` | Buduje bez błędów, katalog `dist/` zawiera pliki z `public/art/` |
| M9 | Uruchom `npm run type-check` | 0 errors |
| M10 | Sprawdź, że proceduralne obiekty (test byt, tło, paralaksa) działają bez zmian | Brak regresji |
| M11 | Usuń `asset-manifest.json`, przeładuj stronę | Ostrzeżenie w konsoli, gra startuje z proceduralnymi profilami, brak crash-a |
| M12 | Wstaw uszkodzony JSON do `asset-manifest.json`, przeładuj | Ostrzeżenie w konsoli, gra startuje, brak crash-a |

### Testy automatyczne (scope Etapu 4)

W Etapie 4 nie wdrażamy frameworka testów jednostkowych. Następujące testy są kandydatami do automatyzacji w przyszłości:

| # | Test | Moduł |
|---|---|---|
| A1 | `validateManifest` zwraca `null` dla pustego inputu | `validateManifest.ts` |
| A2 | `validateManifest` odrzuca wpis z ujemnym `frameWidth` | `validateManifest.ts` |
| A3 | `validateManifest` odrzuca wpis ze zduplikowanym `assetId` | `validateManifest.ts` |
| A4 | `registerManifestProfiles` rejestruje poprawne profile | `registerManifestProfiles.ts` |
| A5 | `registerManifestProfiles` pomija istniejące profile | `registerManifestProfiles.ts` |
| A6 | `AssetLoader.stats` zwraca poprawne wartości po preloadzie | `AssetLoader.ts` |

---

## Struktura plików Etapu 4

```
public/art/
├── asset-manifest.json              ← NOWY: manifest assetów
├── ships/
│   ├── scout-mk1.png                ← NOWY: sprite statku
│   └── freighter-standard.png       ← NOWY: sprite statku
├── stations/
│   ├── trading-outpost.png           ← NOWY: sprite stacji
│   └── mining-platform.png           ← NOWY: sprite stacji
├── gates/
│   ├── stargate-standard.png         ← NOWY: sprite wrót
│   └── jumpgate-ancient.png          ← NOWY: sprite wrót
└── celestial/
    ├── planet-terran.png             ← NOWY: sprite planety
    └── asteroid-rocky.png            ← NOWY: sprite asteroidy

src/
├── presentation/
│   ├── assets/                       ← NOWY KATALOG
│   │   ├── assetTypes.ts             ← NOWY: typy manifestu
│   │   ├── AssetLoader.ts            ← NOWY: ładowanie assetów
│   │   ├── validateManifest.ts       ← NOWY: walidacja manifestu
│   │   ├── registerManifestProfiles.ts ← NOWY: rejestracja profili
│   │   └── index.ts                  ← NOWY: re-eksport
│   └── renderables/
│       ├── EntityRenderable.ts       ← ZMIANA: obsługa sprite + fallback
│       └── RenderableFactory.ts      ← ZMIANA: opcjonalny AssetLoader
└── app/
    ├── AppShell.ts                   ← ZMIANA: AssetLoader, async start, sekcja Assets
    └── Bootstrap.ts                  ← ZMIANA: await start()
```

---

## Podsumowanie zmian do istniejących dokumentów

| Dokument | Zmiana |
|---|---|
| `04_presentation-assets.md` | Zaktualizować sekcję `public/art/` — zmienić status z „planowane" na „Etap 4: ships, stations, gates, celestial". Dodać link: „Kontrakty assetów: `10_etap4-specyfikacja.md`". |
| `05_plan-prac.md` | Dodać link: „Kryteria zamknięcia Etapu 4: `10_etap4-specyfikacja.md`, sekcja 11". |
| `08_etap3-specyfikacja.md` | Bez zmian. |
| `09_etap3.5-specyfikacja.md` | Bez zmian. |
