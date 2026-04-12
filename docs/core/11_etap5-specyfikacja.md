# Etap 5 — Specyfikacja: Seed systemu startowego i osadzenie bytów świata

## Cel

Zastąpić byt testowy (`DevTestEntity`) rzeczywistym ładowaniem seeda systemu startowego i rejestracją encji w `EntityManager` oraz renderowalnych obiektów w `WorldLayer`. Dostarczyć kompletny pipeline: wczytanie pliku seeda → walidacja → instancjonowanie encji → tworzenie renderowalnych → rejestracja w scenie. Po zamknięciu Etapu 5 na ekranie widać jeden w pełni załadowany system gwiezdny z gwiazdą, planetami, księżycami, wrotami, stacjami, asteroidy (rozwinięte z grup), kontenerami, wrakami i statkami.

Etap 5 buduje fundament kompatybilny z Etapem 5.5 (wielosystemowość, sektory, wrota), ale nie implementuje jego zakresu.

---

## 1. Parametry wejściowe

| Parametr | Wartość | Źródło |
|---|---|---|
| Plik seeda systemu | `public/world/systems/<systemId>.json` | Nowy plik danych |
| `AssetManifest` + załadowane obrazy | `AssetLoader.getManifest()`, `AssetLoader.getImage()` | Etap 4 |
| `VisualProfileRegistry` z profilami sprite + proceduralnymi | `visualProfileRegistry` | Etap 3 + 4 |
| `EntityManager` | `entityManager` | Etap 3 |
| `RenderableFactory` | `renderableFactory` | Etap 3 + 4 |
| `WorldLayer` | `worldLayer` | Etap 2 + 3 |
| `OffscreenCache` | `cache` | Etap 2 + 3 + 3.5 |
| Dev Overlay Panel | `DevOverlayPanel` | Etap 3.5 |

---

## 2. Parametry wyjściowe

| Parametr | Wartość |
|---|---|
| Zainstancjonowane encje | Zarejestrowane w `EntityManager`, powiązane z renderowalnymi w `WorldLayer` |
| Utrwalony seed | Plik JSON z wyznaczonymi `orbitPhase` (deterministyczne pozycje) |
| Asteroidy rozwinięte | Grupy `asteroidGroups` rozwinięte do indywidualnych encji z `computedHeight` |
| Porządek rysowania | Deterministyczny, oparty na `height` z seeda + algorytm rozstrzygania remisów |
| Metryki deweloperskie | Nowa sekcja "System" w Dev Overlay: BytCount, rozkład po typach, czas ładowania |

---

## 3. Zachowanie brzegowe

| Sytuacja | Zachowanie |
|---|---|
| Brak kolizji między obiektami | Nachodzenie dozwolone. Kolizje gameplayowe są poza zakresem Etapu 5 |
| Remis `height` | Deterministyczne przesunięcie na podstawie porządku wpisu w pliku seeda (patrz sekcja 6.3) |
| Orbity | Mierzone w pikselach. Pozycja = `parent.position + offset(orbitRadius, orbitPhase)` |
| `orbitPhase` obiektów statycznych | Losowane przy generacji seeda, zapisywane i traktowane jako dane stałe |
| Brak profilu wizualnego | Fallback proceduralny (kolorowy prostokąt z nazwą typu) + `console.warn` |
| Duplikat `id` w seedzie | Odrzucenie wpisu + `console.error`. Pierwszy wpis wygrywa |
| Obiekt statyczny poza `maxBoundaryRadius` | Pominięcie z `console.warn` |
| Obiekt dynamiczny poza `maxBoundaryRadius` | Utworzenie jako nieaktywny (`visible = false`) |
| Brakujący `parentId` (orbitAround) | Odrzucenie wpisu + `console.error` |
| `player-ship` z `height < 11` | Walidator nadpisuje na `11` z `console.warn` |
| Brak pliku seeda | `console.error`, gra startuje z pustym systemem |
| Uszkodzony JSON seeda | Jak brak pliku |

---

## 4. Stan obecny i zależności

### Co istnieje

| Element | Lokalizacja | Status |
|---|---|---|
| `EntityManager` | `entities/base/EntityManager.ts` | ✅ Gotowy — `add`, `remove`, `get`, `has`, `getAll`, `getByCategory`, `sweepDead`, `size` |
| `BaseEntity` | `entities/base/BaseEntity.ts` | ✅ Gotowy — abstrakcyjna klasa z `savePreviousState()` |
| `GameEntity` | `entities/base/GameEntity.ts` | ✅ Gotowy — interfejs z `id`, `category`, `position`, `velocity`, `rotation`, `boundingBox`, `isAlive()` |
| `EntityCategory` | `entities/base/EntityCategory.ts` | ✅ Gotowy — `ship \| station \| gate \| wreck \| projectile \| celestial \| environment` |
| `WorldLayer` | `presentation/scene/WorldLayer.ts` | ✅ Gotowy — `addRenderable`, `removeRenderable`, frustum culling, metryki |
| `RenderableFactory` | `presentation/renderables/RenderableFactory.ts` | ✅ Gotowy — `create(entity, profile)` → `Renderable` |
| `EntityRenderable` | `presentation/renderables/EntityRenderable.ts` | ✅ Gotowy — interpolacja, sprite + procedural + fallback |
| `VisualProfile` | `presentation/profiles/VisualProfile.ts` | ✅ Gotowy — `profileId`, `category`, `size`, `cullRadius`, `source` |
| `VisualProfileRegistry` | `presentation/profiles/VisualProfileRegistry.ts` | ✅ Gotowy — `register`, `get`, `has`, `getAll` |
| `AssetLoader` | `presentation/assets/AssetLoader.ts` | ✅ Gotowy — `loadManifest`, `preloadAll`, `getImage`, `stats` |
| `asset-manifest.json` | `public/art/asset-manifest.json` | ✅ Gotowy — 8 assetów (2× ship, 2× station, 2× gate, 2× celestial) |
| `DevOverlayPanel` | `dev/DevOverlayPanel.ts` | ✅ Gotowy — `registerSection`, `registerMetric`, `update` |
| `AppShell` | `app/AppShell.ts` | ✅ Gotowy — orkiestracja, `async start()`, `renderablesByEntityId`, test entity, sprite test |
| Katalog `public/world/` | nie istnieje | ❌ Brak — trzeba utworzyć |
| Katalog `src/world/` | nie istnieje | ❌ Brak — trzeba utworzyć |

### Czego brakuje

1. **Brak formatu seeda systemu** — nie ma schematu pliku JSON definiującego obiekty systemu.
2. **Brak loadera seeda** — nie ma klasy ładującej i walidującej plik seeda.
3. **Brak konkretnych klas encji** — `BaseEntity` jest abstrakcyjna; brak `CelestialEntity`, `StationEntity`, `GateEntity` itp.
4. **Brak mechanizmu rozwijania grup asteroidy** — `asteroidGroups` z 12_etap5-podstawa-specyfikacji.md nie ma implementacji.
5. **Brak obliczania pozycji z orbit** — konwersja `(orbitRadius, orbitPhase, parentId)` → `Vector2` nie istnieje.
6. **Brak sortowania renderowalnych po `height`** — `WorldLayer` nie sortuje po porządku rysowania.
7. **Brak pipeline'u wiążącego seed → encje → renderables → scene**.

---

## 5. Zakres Etapu 5

### Wchodzi w Etap 5

1. Schemat pliku seeda systemu (`SystemSeed`) i typy TypeScript.
2. Plik seeda startowego `public/world/systems/sol-001.json`.
3. `SystemSeedLoader` — ładowanie, walidacja, instancjonowanie.
4. Konkretne klasy encji świata: `CelestialEntity`, `StationEntity`, `GateEntity`, `WreckEntity`, `ContainerEntity`, `AsteroidEntity`, `NpcShipEntity`, `PlayerShipEntity`.
5. Mechanizm rozwijania `asteroidGroups` do indywidualnych `AsteroidEntity`.
6. Obliczanie pozycji z orbit (`orbitRadius` + `orbitPhase` + `parentId`).
7. Sortowanie renderowalnych w `WorldLayer` po `height` (porządek rysowania).
8. Pipeline runtime: load seed → validate → compute positions → instantiate entities → create renderables → register to scene.
9. Sekcja "System" w Dev Overlay Panel.
10. Rozszerzenie Dev Overlay o formularz ręcznego spawnu encji.
11. Walidacja seeda z logowaniem `warn`/`error`.

### NIE wchodzi w Etap 5

- Wielosystemowość, sektory, `SectorDef` — to Etap 5.5.
- Przejścia przez wrota i `transitionUnit()` — to Etap 5.5.
- Widoczność jednostek przez bramy — to Etap 5.5.
- Spawnowanie dynamiczne z limitami (`Spawner`, `SpawnLimits`) — to Etap 5.5.
- Kolizje gameplayowe i systemy bojowe — to Etap 6.
- Mechaniki lotu, reaktora, broni, osłon — to Etap 6.
- HUD, menu, ekrany UI — to Etap 7.
- Reputacja sektora i gating modułów — to Etap 5.5.
- Animacje sprite'ów — to Etap 9.
- Dynamiczny ruch planet/księżycy po orbitach w runtime (orbity są wizualne/statyczne w Etapie 5).

---

## 6. Kontrakty danych seeda

### 6.1. `SystemSeed` — schemat pliku JSON

```typescript
// world/seed/seedTypes.ts

import type { Vector2 } from '@/types/common';

/** Pełny seed systemu startowego. */
export interface SystemSeed {
  /** Wersja schematu seeda. */
  schemaVersion: 1;

  /** Unikalny identyfikator systemu. */
  systemId: string;

  /** Nazwa systemu (do wyświetlania). */
  name: string;

  /** Punkt referencyjny systemu. Domyślnie { x: 0, y: 0 }. */
  center: Vector2;

  /** Promień granicy informacyjnej (px). UI może rysować tę granicę. */
  informationalBoundaryRadius: number;

  /** Maksymalna odległość od centrum, powyżej której obiekty są poza systemem (px). */
  maxBoundaryRadius: number;

  /** Lista obiektów systemu (bez asteroid — te są w asteroidGroups). */
  objects: SeedObject[];

  /** Definicje grup asteroid. Runtime rozwija je do encji. */
  asteroidGroups: AsteroidGroupDef[];
}

/** Pojedynczy obiekt w seedzie systemu. */
export interface SeedObject {
  /** Unikalny identyfikator obiektu w obrębie systemu. */
  id: string;

  /** Typ obiektu. */
  type: SeedObjectType;

  /** Identyfikator profilu wizualnego z VisualProfileRegistry. */
  profileId: string;

  /** Promień orbity w pikselach. 0 = w centrum systemu. */
  orbitRadius: number;

  /** Faza orbity w stopniach (0–360). Deterministyczna po generacji seeda. */
  orbitPhase: number;

  /** ID obiektu, wokół którego orbituje. null = centrum systemu. */
  orbitAround: string | null;

  /** Czy obiekt jest nieruchomy (nie ma update() runtime). */
  static: boolean;

  /** Wartość porządku rysowania. Większa = rysowane nad innymi. */
  height: number;
}

/** Dozwolone typy obiektów w seedzie. */
export type SeedObjectType =
  | 'star'
  | 'planet'
  | 'moon'
  | 'gate'
  | 'station-wreck'
  | 'station'
  | 'container'
  | 'ship-wreck'
  | 'npc-ship'
  | 'player-ship';

/** Definicja grupy asteroid w seedzie. */
export interface AsteroidGroupDef {
  /** Identyfikator grupy (np. 'belt-1'). */
  id: string;

  /** Promień orbity środka pasa od centrum systemu (px). */
  orbitRadius: number;

  /** Faza orbity środka pasa (stopnie, 0–360). */
  orbitPhase: number;

  /** ID obiektu, wokół którego orbituje pas. null = centrum systemu. */
  orbitAround?: string | null;

  /** Długość łuku/pasa w pikselach. */
  length: number;

  /** Grubość pasa w pikselach. */
  width: number;

  /** Średnia liczba asteroid na jednostkę długości. Ignorowane jeśli count jest podany. */
  density?: number;

  /** Opcjonalna dokładna liczba asteroid (nadpisuje density). */
  count?: number;

  /** Bazowe height dla pasa (domyślnie 7). */
  height: number;

  /** Indeks pasa do obliczania computedHeight. */
  beltIndex: number;

  /** Identyfikator profilu wizualnego dla asteroid w tym pasie. */
  profileId: string;

  /** Opcjonalny seed losowy dla deterministycznej generacji pozycji. */
  seed?: number;
}
```

### 6.2. Mapowanie `SeedObjectType` → `EntityCategory`

```typescript
// world/seed/seedTypeMapping.ts

import type { EntityCategory } from '@entities/base/EntityCategory';
import type { SeedObjectType } from './seedTypes';

export const SEED_TYPE_TO_CATEGORY: Record<SeedObjectType, EntityCategory> = {
  'star': 'celestial',
  'planet': 'celestial',
  'moon': 'celestial',
  'gate': 'gate',
  'station-wreck': 'wreck',
  'station': 'station',
  'container': 'environment',
  'ship-wreck': 'wreck',
  'npc-ship': 'ship',
  'player-ship': 'ship',
};
```

### 6.3. Bazowa numeracja porządku rysowania i rozstrzyganie remisów

| # | Typ | Bazowy `height` |
|---|---|---|
| 1 | star | 1 |
| 2 | planet | 2 |
| 3 | moon | 3 |
| 4 | gate | 4 |
| 5 | station-wreck | 5 |
| 6 | station | 6 |
| 7 | asteroid | 7 |
| 8 | container | 8 |
| 9 | ship-wreck | 9 |
| 10 | npc-ship | 10 |
| 11 | player-ship | 11 |

**Rozstrzyganie remisów `height`:** Jeśli dwa obiekty mają identyczną wartość `height`, porządek rysowania jest rozstrzygany deterministycznie przez pozycję wpisu w pliku seeda. Obiekt wcześniejszy w tablicy `objects` otrzymuje niższą wartość `computedHeight`:

```
computedHeight = height + (indexInSeedFile / 10000)
```

Dla asteroid z grup:

```
computedHeight = 7 + (beltIndex / 100) + (asteroidIndex / 1000)
```

**Sortowanie w `WorldLayer`:** Tablica `renderables` jest sortowana rosnąco po `computedHeight` w `WorldLayer.update()`. Obiekty o niższym `computedHeight` rysowane są wcześniej (pod spodem).

---

## 7. Pipeline runtime

### 7.1. Sekwencja startowa (`AppShell.start()`)

```
1. loadManifest('/art/asset-manifest.json')
2. preloadAll() — załaduj obrazy sprite'ów
3. registerManifestProfiles() — zarejestruj profile w VisualProfileRegistry
4. loadSystemSeed('/world/systems/sol-001.json')  ← NOWE
5. validateSeed()                                   ← NOWE
6. computePositions()                               ← NOWE
7. expandAsteroidGroups()                           ← NOWE
8. instantiateEntities()                            ← NOWE
9. createRenderables()                              ← NOWE
10. registerToScene()                               ← NOWE
11. gameLoop.start()
```

### 7.2. `SystemSeedLoader` — klasa ładująca

```typescript
// world/seed/SystemSeedLoader.ts

import type { SystemSeed, SeedObject, AsteroidGroupDef } from './seedTypes';
import type { EntityManager } from '@entities/base/EntityManager';
import type { VisualProfileRegistry } from '@presentation/profiles/VisualProfileRegistry';
import type { RenderableFactory } from '@presentation/renderables/RenderableFactory';
import type { WorldLayer } from '@presentation/scene/WorldLayer';
import type { Renderable } from '@/types/engine';

export interface SystemLoadResult {
  systemId: string;
  entityCount: number;
  renderableCount: number;
  asteroidCount: number;
  warnings: string[];
  errors: string[];
  loadTimeMs: number;
}

export class SystemSeedLoader {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly profileRegistry: VisualProfileRegistry,
    private readonly renderableFactory: RenderableFactory,
    private readonly worldLayer: WorldLayer,
    private readonly renderablesByEntityId: Map<string, Renderable>,
  );

  /** Ładuje seed z URL, waliduje, instancjonuje, rejestruje. */
  async loadSystem(url: string): Promise<SystemLoadResult>;

  /** Rozładowuje aktualny system — czyści EntityManager, WorldLayer, renderables. */
  unloadCurrentSystem(): void;
}
```

### 7.3. Obliczanie pozycji z orbit

```typescript
// world/seed/orbitUtils.ts

import type { Vector2 } from '@/types/common';

/** Oblicza pozycję na orbicie. */
export function computeOrbitPosition(
  parentPosition: Vector2,
  orbitRadius: number,
  orbitPhaseDeg: number,
): Vector2 {
  const rad = (orbitPhaseDeg * Math.PI) / 180;
  return {
    x: parentPosition.x + orbitRadius * Math.cos(rad),
    y: parentPosition.y + orbitRadius * Math.sin(rad),
  };
}
```

Pozycje obiektów są obliczane w kolejności topologicznej: najpierw obiekty bez parenta (`orbitAround === null`), potem obiekty orbitujące wokół już obliczonych obiektów. Cykl referencji jest traktowany jako błąd walidacji.

### 7.4. Rozwijanie grup asteroid

Każda `AsteroidGroupDef` jest rozwijana do `N` indywidualnych encji `AsteroidEntity`:

1. Oblicz `N`: jeśli podane `count`, użyj go; w przeciwnym wypadku `N = Math.round(length * density)`.
2. Oblicz pozycję środka pasa: `computeOrbitPosition(parentPos, orbitRadius, orbitPhase)`.
3. Dla każdej asteroidy `i` w `[0, N)`:
   - Użyj deterministycznego PRNG z `seed` (lub `beltIndex * 1000 + i` jeśli brak seeda) do wylosowania offsetu w obrębie pasa (`[-length/2, +length/2]` × `[-width/2, +width/2]`).
   - `computedHeight = 7 + (beltIndex / 100) + (i / 1000)`.
   - `id = "<groupId>-ast-<i>"`.
   - Stwórz `AsteroidEntity` i `Renderable`.

### 7.5. Deterministyczny PRNG

```typescript
// world/seed/deterministicRandom.ts

/** Prosty deterministyczny PRNG (mulberry32). */
export function createDeterministicRng(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

---

## 8. Konkretne klasy encji

### 8.1. `WorldEntity` — wspólna klasa encji świata seedowej

```typescript
// world/entities/WorldEntity.ts

import { BaseEntity } from '@entities/base/BaseEntity';
import type { EntityCategory } from '@entities/base/EntityCategory';
import type { Vector2 } from '@/types/common';
import type { AABB } from '@physics/types';
import { Vec2 } from '@physics/Vector2';
import type { SeedObjectType } from '../seed/seedTypes';

/**
 * Wspólna klasa bazowa dla wszystkich bytów tworzonych z seeda systemu.
 * Obiekty statyczne nie mają update(). Obiekty dynamiczne — tak.
 */
export class WorldEntity extends BaseEntity {
  public readonly boundingBox: AABB;
  public readonly computedHeight: number;
  public readonly seedType: SeedObjectType;
  public readonly isStatic: boolean;
  public readonly profileId: string;

  constructor(config: {
    id: string;
    category: EntityCategory;
    seedType: SeedObjectType;
    position: Vector2;
    width: number;
    height: number;
    computedHeight: number;
    isStatic: boolean;
    profileId: string;
  }) {
    super(config.id, config.category, config.position);
    this.seedType = config.seedType;
    this.computedHeight = config.computedHeight;
    this.isStatic = config.isStatic;
    this.profileId = config.profileId;
    this.boundingBox = {
      min: new Vec2(-config.width / 2, -config.height / 2),
      max: new Vec2(config.width / 2, config.height / 2),
    };
  }
}
```

**Decyzja architekturalna:** Zamiast odrębnych klas `CelestialEntity`, `StationEntity`, `GateEntity` itd., Etap 5 używa jednej klasy `WorldEntity` z polem `seedType`. Odrębne klasy będą potrzebne dopiero gdy pojawi się specyficzna logika gameplayowa (Etap 6+). W Etapie 5 każdy obiekt ma identyczny zestaw pól i zachowań (pozycja, rotacja, bounding box, statyczność).

---

## 9. Walidacja i obsługa błędów

### 9.1. `validateSystemSeed()`

```typescript
// world/seed/validateSystemSeed.ts

import type { SystemSeed } from './seedTypes';

export interface SeedValidationResult {
  valid: boolean;
  seed: SystemSeed | null;
  warnings: string[];
  errors: string[];
}

export function validateSystemSeed(raw: unknown): SeedValidationResult;
```

### 9.2. Reguły walidacji

| # | Reguła | Poziom | Akcja |
|---|---|---|---|
| V1 | `schemaVersion !== 1` | error | Odrzucenie seeda |
| V2 | Brak `systemId` lub `name` | error | Odrzucenie seeda |
| V3 | `center` nie jest `{x: number, y: number}` | error | Odrzucenie seeda |
| V4 | `informationalBoundaryRadius <= 0` | error | Odrzucenie seeda |
| V5 | `maxBoundaryRadius <= 0` | error | Odrzucenie seeda |
| V6 | `objects` nie jest tablicą | error | Odrzucenie seeda |
| V7 | Zduplikowany `id` w `objects` | error | Odrzucenie drugiego wpisu |
| V8 | `type` spoza dozwolonych `SeedObjectType` | warn | Pominięcie wpisu |
| V9 | `profileId` pusty | warn | Pominięcie wpisu |
| V10 | `orbitRadius < 0` | warn | Pominięcie wpisu |
| V11 | `orbitPhase` spoza [0, 360) | warn | Normalizacja do [0, 360) |
| V12 | `orbitAround` wskazuje na nieistniejący `id` | error | Pominięcie wpisu |
| V13 | Cykl referencji `orbitAround` | error | Pominięcie wpisu tworzącego cykl |
| V14 | `height <= 0` | warn | Ustawienie na bazową wartość dla typu |
| V15 | `player-ship` z `height < 11` | warn | Nadpisanie na `11` |
| V16 | Obiekt statyczny poza `maxBoundaryRadius` | warn | Pominięcie wpisu |
| V17 | Obiekt dynamiczny poza `maxBoundaryRadius` | warn | Utworzenie jako `visible = false` |
| V18 | `asteroidGroups[i].count <= 0` i brak `density` | warn | Pominięcie grupy |
| V19 | `asteroidGroups[i].beltIndex` zduplikowany | warn | Automatyczne przypisanie unikalnego indeksu |
| V20 | `asteroidGroups[i].profileId` pusty | warn | Pominięcie grupy |

### 9.3. Logowanie

Wszystkie ostrzeżenia i błędy logowane przez `console.warn` / `console.error` z prefiksem `[SystemSeedLoader]`.

Zbierane w `SystemLoadResult.warnings` i `SystemLoadResult.errors` — dostępne w Dev Overlay.

---

## 10. Sortowanie renderowalnych i rozszerzenie WorldLayer

### 10.1. Rozszerzenie `Renderable`

Dodać pole `computedHeight` do interfejsu `Renderable` w `types/engine.ts`:

```typescript
export interface Renderable {
  // ... istniejące pola ...

  /** Porządek rysowania — mniejszy = rysowany wcześniej (pod spodem). */
  computedHeight: number;
}
```

### 10.2. Rozszerzenie `WorldLayer.update()`

W `WorldLayer.update()` dodać sortowanie tablicy `renderables` rosnąco po `computedHeight`:

```typescript
public update(_dt: number, _camera: Camera): void {
  this.renderables.sort((a, b) => a.computedHeight - b.computedHeight);
}
```

Sortowanie co klatkę jest akceptowalne dla <500 obiektów. Optymalizacja (dirty flag) jest kandydatem na przyszłość.

---

## 11. Integracja z Dev Overlay

### 11.1. Sekcja "System"

| Metryka | Getter | Format |
|---|---|---|
| `system` | `currentSystemId` | string |
| `entities` | `entityManager.size` | liczba |
| `asteroids` | liczba encji z `seedType === 'asteroid'` | liczba |
| `load time` | `lastLoadResult.loadTimeMs` | `N ms` |
| `warnings` | `lastLoadResult.warnings.length` | liczba |
| `errors` | `lastLoadResult.errors.length` | liczba |

### 11.2. Formularz ręcznego spawnu (Dev Spawn)

Nowa sekcja "Dev Spawn" w Dev Overlay:

| Kontrola | Typ | Opis |
|---|---|---|
| `type` | select | Wybór `SeedObjectType` |
| `profileId` | select | Profile z `VisualProfileRegistry` (filtrowane po kategorii mapowanej z wybranego type) |
| `orbitRadius` | number input | Promień orbity (px). Domyślnie: 300 |
| `orbitPhase` | number input | Faza orbity (deg, 0–360). Domyślnie: 0 |
| `orbitAround` | select | Lista istniejących obiektów + "centrum" |
| `height` | number input | Porządek rysowania. Domyślnie: bazowy dla typu |
| `Spawn` | button | Tworzy encję + renderable, rejestruje w systemie |

---

## 12. Kryteria zamknięcia Etapu 5

### Co działa po `npm run dev`

| # | Kryterium | Opis |
|---|---|---|
| K1 | System załadowany | Po starcie gry na canvasie widać obiekty systemu `sol-001`: gwiazdę, planety, księżyc, stacje, wrota, kontenery, wraki, asteroidy |
| K2 | Seed wczytany z pliku | `public/world/systems/sol-001.json` jest wczytywany przez `SystemSeedLoader` |
| K3 | Pozycje poprawne | Obiekty umieszczone na orbitach (pozycja = parent.position + offset z orbitRadius i orbitPhase) |
| K4 | Asteroidy rozwinięte | `asteroidGroups` z seeda rozwinięte do indywidualnych encji widocznych na canvasie |
| K5 | Porządek rysowania | Gwiazda pod planetami, planety pod stacjami, stacje pod statkami — zgodnie z `height` |
| K6 | Brak flickeringu | Dwa obiekty z tym samym `height` nigdy nie zamieniają się kolejnością rysowania między klatkami |
| K7 | DevOverlay: sekcja System | Sekcja "System" w Dev Overlay pokazuje `system`, `entities`, `asteroids`, `load time`, `warnings`, `errors` |
| K8 | Walidacja seeda | Celowe błędy w seedzie (duplikat id, brakujący parent, obiekt poza granicą) generują odpowiednie logi |
| K9 | Fallback profilu | Obiekt z nieistniejącym `profileId` renderuje się z fallbackiem proceduralnym + `console.warn` |
| K10 | Deterministyczność | Identyczny seed generuje identyczny układ obiektów i identyczny porządek rysowania po każdym przeładowaniu |
| K11 | Dev Spawn | Formularz ręcznego spawnu w Dev Overlay tworzy nową encję widoczną na canvasie |
| K12 | Test entity usunięty | `DevTestEntity` nie jest potrzebny — zostaje jako opcja debug, ale domyślnie wyłączony |
| K13 | Brak regresji | Tło, paralaksa, debug grid, culling, interpolacja, cache — wszystko działa bez zmian |
| K14 | Kompilacja | `npm run type-check` — 0 errors. `npm run build` — buduje bez błędów |

### Artefakty zamykające Etap 5

| Artefakt | Stan |
|---|---|
| `world/seed/seedTypes.ts` — typy seeda | Gotowy |
| `world/seed/seedTypeMapping.ts` — mapowanie typów | Gotowy |
| `world/seed/validateSystemSeed.ts` — walidacja | Gotowy |
| `world/seed/orbitUtils.ts` — obliczanie pozycji | Gotowy |
| `world/seed/deterministicRandom.ts` — PRNG | Gotowy |
| `world/seed/expandAsteroidGroups.ts` — rozwijanie grup | Gotowy |
| `world/seed/SystemSeedLoader.ts` — loader | Gotowy |
| `world/seed/index.ts` — re-eksport | Gotowy |
| `world/entities/WorldEntity.ts` — klasa encji | Gotowy |
| `world/entities/index.ts` — re-eksport | Gotowy |
| `public/world/systems/sol-001.json` — seed | Gotowy |
| `presentation/scene/WorldLayer.ts` — sortowanie | Rozszerzony |
| `types/engine.ts` — `computedHeight` w Renderable | Rozszerzony |
| `app/AppShell.ts` — integracja loadera | Rozszerzony |
| `npm run type-check` | 0 errors |
| `npm run build` | Buduje bez błędów |

---

## 13. Plan testów

### Testy ręczne

| # | Test | Oczekiwany wynik |
|---|---|---|---|
| M1 | Uruchom `npm run dev` — system załadowany | Canvas pokazuje gwiezdę w centrum, planety na orbitach, stacje, wrota itd. | nie gwiazde, ale obiekt sie pojawia wiec test spelniony |
| M2 | Dev Overlay → sekcja System → entities > 0 | Liczba odpowiada liczbie obiektów w seedzie + rozwinięte asteroidy | Wszystko sie zgadza |
| M3 | Dev Overlay → System → load time < 500ms | Seed ładuje się szybko | Wszystko sie zgadza |
| M4 | Dev Overlay → System → warnings = 0, errors = 0 | Poprawny seed nie generuje ostrzeżeń | Wszystko sie zgadza |
| M5 | Zmień `profileId` na nieistniejący w seedzie, przeładuj | Czerwony prostokąt z fallbackiem, `console.warn` w konsoli | Wszystko sie zgadza |
| M6 | Duplikuj `id` obiektu w seedzie, przeładuj | Drugi wpis odrzucony, `console.error` w konsoli | Wszystko sie zgadza |
| M7 | Ustaw `orbitAround` na nieistniejący id, przeładuj | Wpis odrzucony, `console.error` w konsoli | Wszystko sie zgadza |
| M8 | Ustaw obiekt statyczny daleko poza `maxBoundaryRadius`, przeładuj | Obiekt pominięty, `console.warn` | Wszystko sie zgadza |
| M9 | Usuń `sol-001.json`, przeładuj | Gra startuje z pustym systemem, `console.error` | Wszystko sie zgadza |
| M10 | Przeładuj stronę 3 razy — pozycje identyczne | Deterministyczność potwierdzona | Wszystko sie zgadza |
| M11 | Przesuń kamerę — culling działa | Obiekty poza frustum nie renderują się |  Wszystko sie zgadza |
| M12 | Dev Overlay → Dev Spawn → spawn nowego obiektu | Obiekt pojawia się na canvasie | Wszystko sie zgadza |
| M13 | `npm run type-check` | 0 errors | Wszystko sie zgadza |
| M14 | `npm run build` | Buduje bez błędów | Wszystko sie zgadza |

### Kandydaci do automatyzacji

| # | Test | Moduł |
|---|---|---|
| A1 | `validateSystemSeed` odrzuca brak `systemId` | `validateSystemSeed.ts` |
| A2 | `validateSystemSeed` odrzuca duplikat `id` | `validateSystemSeed.ts` |
| A3 | `computeOrbitPosition` daje poprawne współrzędne | `orbitUtils.ts` |
| A4 | `expandAsteroidGroups` generuje poprawną liczbę asteroid | `expandAsteroidGroups.ts` |
| A5 | `createDeterministicRng` daje powtarzalne wyniki | `deterministicRandom.ts` |
| A6 | Sortowanie renderables po `computedHeight` jest stabilne | `WorldLayer.ts` |

---

## 14. Kolejność implementacji krok po kroku

```
Krok 1: Typy seeda
         world/seed/seedTypes.ts
         world/seed/seedTypeMapping.ts
         ↓
Krok 2: Deterministyczny PRNG
         world/seed/deterministicRandom.ts
         ↓
Krok 3: Obliczanie pozycji z orbit
         world/seed/orbitUtils.ts
         ↓
Krok 4: Walidacja seeda
         world/seed/validateSystemSeed.ts
         ↓
Krok 5: Rozwijanie grup asteroid
         world/seed/expandAsteroidGroups.ts
         ↓
Krok 6: Klasa encji WorldEntity
         world/entities/WorldEntity.ts
         world/entities/index.ts
         ↓
Krok 7: Rozszerzenie Renderable o computedHeight
         types/engine.ts — dodanie pola computedHeight
         presentation/renderables/EntityRenderable.ts — inicjalizacja pola
         ↓
Krok 8: Sortowanie w WorldLayer
         presentation/scene/WorldLayer.ts — sortowanie po computedHeight w update()
         ↓
Krok 9: SystemSeedLoader
         world/seed/SystemSeedLoader.ts
         world/seed/index.ts
         ↓
Krok 10: Plik seeda startowego
          public/world/systems/sol-001.json
          ↓
Krok 11: Integracja z AppShell
          app/AppShell.ts — instancja SystemSeedLoader, wywołanie loadSystem() w start()
          ↓
Krok 12: Sekcja System w Dev Overlay
          app/AppShell.ts — rejestracja sekcji 'system' z metrykami
          ↓
Krok 13: Formularz Dev Spawn w Dev Overlay
          app/AppShell.ts — rejestracja sekcji 'dev-spawn' z kontrolkami
          ↓
Krok 14: Konfiguracja aliasów
          tsconfig.json i vite.config.ts: "@world/*": ["./src/world/*"]
          ↓
Krok 15: Re-eksporty
          world/seed/index.ts, world/entities/index.ts
          ↓
Krok 16: Weryfikacja ręczna
          npm run dev — system załadowany, obiekty widoczne
          npm run type-check — 0 errors
          npm run build — buduje bez błędów
```

---

## Struktura plików Etapu 5

```
public/world/
└── systems/
    └── sol-001.json                    ← NOWY: seed systemu startowego

src/
├── world/                              ← NOWY KATALOG
│   ├── seed/
│   │   ├── seedTypes.ts                ← NOWY: typy seeda
│   │   ├── seedTypeMapping.ts          ← NOWY: mapowanie SeedObjectType → EntityCategory
│   │   ├── validateSystemSeed.ts       ← NOWY: walidacja seeda
│   │   ├── orbitUtils.ts               ← NOWY: obliczanie pozycji z orbit
│   │   ├── deterministicRandom.ts      ← NOWY: PRNG mulberry32
│   │   ├── expandAsteroidGroups.ts     ← NOWY: rozwijanie grup do encji
│   │   ├── SystemSeedLoader.ts         ← NOWY: loader + pipeline
│   │   └── index.ts                    ← NOWY: re-eksport
│   └── entities/
│       ├── WorldEntity.ts              ← NOWY: klasa encji świata
│       └── index.ts                    ← NOWY: re-eksport
├── types/
│   └── engine.ts                       ← ZMIANA: Renderable + computedHeight
├── presentation/
│   ├── renderables/
│   │   └── EntityRenderable.ts         ← ZMIANA: inicjalizacja computedHeight
│   └── scene/
│       └── WorldLayer.ts               ← ZMIANA: sortowanie po computedHeight
└── app/
    └── AppShell.ts                     ← ZMIANA: integracja SystemSeedLoader, sekcja System, Dev Spawn
```

---

## Podsumowanie zmian do istniejących dokumentów

| Dokument | Zmiana |
|---|---|
| `05_plan-prac.md` | Dodać link: „Kryteria zamknięcia Etapu 5: `11_etap5-specyfikacja.md`, sekcja 12". |
| `10_etap4-specyfikacja.md` | Bez zmian. |
| `12_etap5-podstawa-specyfikacji.md` | Bez zmian — dokument jest wstępnym szkicem, Etap 5 go uszczegółowia i formalizuje. |
