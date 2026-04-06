# Etap 3 — Specyfikacja uzupełniająca

## Cel
Dokument zamyka luki przed Etapem 3.
Dotyczy: `entities/base/`, `presentation/renderables/`, `presentation/profiles/`.
Buduje na fundamencie Etapu 1 (AppShell, GameLoop, Renderer, Camera, typy) i Etapu 2 (SceneRenderer, WorldLayer, OffscreenCache).

Etap 3 ustanawia **wspólne kontrakty bazowe** dla bytów świata oraz **wspólne kontrakty wizualne** określające, jak byt jest rysowany na canvasie. Po zamknięciu Etapu 3 każdy konkretny typ bytu (statek, stacja, wrota…) może być implementowany w Etapach 4–5 bez potrzeby modyfikowania warstwy bazowej.

---

## 1. Stan obecny

### Co istnieje

| Element | Lokalizacja | Status |
|---|---|---|
| `EntityId` (type alias) | `types/common.ts` | Zdefiniowany jako `string` |
| `Vector2` (interfejs) | `types/common.ts` | Zdefiniowany |
| `Vec2` (klasa operacji) | `physics/Vector2.ts` | Zaimplementowana |
| `AABB`, `CollisionResult` | `physics/types.ts` | Zdefiniowane (stub) |
| `Renderable` (interfejs) | `types/engine.ts` | Minimalny: `position`, `rotation`, `render()` |
| `WorldLayer` | `presentation/scene/WorldLayer.ts` | Stub — `update()` i `render()` puste |
| `OffscreenCache` | `presentation/cache/OffscreenCache.ts` | Zaimplementowany (tło + paralaksa) |
| Katalog `entities/` | nie istnieje | Brak katalogu i plików |
| Katalog `presentation/renderables/` | nie istnieje | Brak katalogu i plików |
| Katalog `presentation/profiles/` | nie istnieje | Brak katalogu i plików |

### Czego brakuje

1. **Brak bazowego kontraktu bytu świata** — nie ma interfejsu opisującego wspólny zestaw pól każdego obiektu w świecie gry (id, pozycja, prędkość, obrót, HP, kolizja, frakcja).
2. **Brak cyklu życia bytu** — nie ma kontraktu `update(dt)`, `isAlive()`, `destroy()`.
3. **`Renderable` jest zbyt prosty** — obecny interfejs ma tylko `position`, `rotation` i `render()`. Nie ma informacji o rozmiarze, bounding boxie wizualnym, widoczności, profilu wizualnym ani o powiązaniu z bytem logicznym.
4. **Brak profili wizualnych** — dokumenty wspominają, że statki, stacje, wrota i planety mają profile wizualne (`04_presentation-assets.md`), ale nie ma żadnego kontraktu na profil.
5. **`WorldLayer` nie ma kolekcji bytów** — stub nie przechowuje ani nie iteruje po żadnej liście obiektów.
6. **Brak rejestracji bytów w scenie** — brak mechanizmu, który łączy byt logiczny z jego wizualną reprezentacją i rejestruje go w `WorldLayer`.
7. **`OffscreenCache` nie ma limitu pamięci dla cache bytów** — etap 2 to odkładał na etap 3.

### Niespójności

| Problem | Szczegół |
|---|---|
| Podwójna reprezentacja pozycji | `Renderable` używa `Vector2` (interfejs), fizyka używa `Vec2` (klasa). Renderable powinien korzystać z `Vector2` (interfejs), a konwersja z `Vec2` jest odpowiedzialnością warstwy łączącej. To nie jest problem do rozwiązania — to świadoma decyzja z Etapu 1. |
| `Renderable.render()` dostaje `alpha` | Byt logiczny nie wie o interpolacji. Renderable potrzebuje zarówno aktualnej pozycji, jak i poprzedniej, aby interpolować. Obecny interfejs tego nie obsługuje. |
| Brak kategorii bytów | `02_gameplay-domeny.md` wymienia: ships, stations, gates, wrecks, projectiles, environment — ale nie ma typu wyliczeniowego (`EntityCategory`). |

---

## 2. Docelowe kontrakty bazowe bytów świata (`entities/base/`)

### Decyzja architekturalna
Byty świata są definiowane przez interfejsy i klasy bazowe w `entities/base/`. Każdy byt to obiekt logiczny — **nie zawiera logiki rysowania**. Rysowanie jest odpowiedzialnością `presentation/`.

### `EntityCategory`

```typescript
// entities/base/EntityCategory.ts

/** Kategoria bytu świata. */
export type EntityCategory =
  | 'ship'
  | 'station'
  | 'gate'
  | 'wreck'
  | 'projectile'
  | 'celestial'       // planety, gwiazdy, asteroidy
  | 'environment';    // pola kosmiczne, mgławice hazardowe
```

### `GameEntity` — bazowy interfejs bytu

```typescript
// entities/base/GameEntity.ts

import type { EntityId, Vector2 } from '@/types/common';
import type { AABB } from '@physics/types';
import type { EntityCategory } from './EntityCategory';

/** Wspólny kontrakt każdego bytu w świecie gry. */
export interface GameEntity {
  /** Unikalny identyfikator w obrębie aktywnej sceny. */
  readonly id: EntityId;

  /** Kategoria bytu — statyczna, nie zmienia się w runtime. */
  readonly category: EntityCategory;

  /** Pozycja w świecie (jednostki: metry). */
  position: Vector2;

  /** Pozycja w poprzednim ticku — do interpolacji w renderze. */
  previousPosition: Vector2;

  /** Prędkość (jednostki: m/s). */
  velocity: Vector2;

  /** Kąt obrotu w radianach. 0 = prawo, PI/2 = dół (układ canvas). */
  rotation: number;

  /** Kąt obrotu w poprzednim ticku — do interpolacji. */
  previousRotation: number;

  /** Bounding box do kolizji i culling. Współrzędne lokalne. */
  readonly boundingBox: AABB;

  /** Czy byt jest aktywny (żywy / istnieje w świecie). */
  isAlive(): boolean;
}
```

### `DestroyableEntity` — byt ze zdrowiem

```typescript
// entities/base/DestroyableEntity.ts

import type { GameEntity } from './GameEntity';

/** Byt, który może zostać zniszczony (HP, osłony). */
export interface DestroyableEntity extends GameEntity {
  /** Aktualne HP kadłuba. */
  hullHp: number;

  /** Maksymalne HP kadłuba. */
  readonly maxHullHp: number;

  /** Aktualne HP osłony (0 jeśli brak osłony). */
  shieldHp: number;

  /** Maksymalne HP osłony. */
  readonly maxShieldHp: number;

  /** Zadaj obrażenia — osłona absorbuje pierwsza. */
  takeDamage(amount: number): void;
}
```

### `FactionOwned` — przynależność frakcyjna

```typescript
// entities/base/FactionOwned.ts

/** Byt posiadający przynależność frakcyjną. */
export interface FactionOwned {
  /** ID frakcji. null = neutralny / niezrzeszony. */
  factionId: string | null;
}
```

### `BaseEntity` — abstrakcyjna klasa bazowa

```typescript
// entities/base/BaseEntity.ts

import type { Vector2 } from '@/types/common';
import type { EntityId } from '@/types/common';
import type { AABB } from '@physics/types';
import type { EntityCategory } from './EntityCategory';
import type { GameEntity } from './GameEntity';

/** Abstrakcyjna klasa bazowa — domyślna implementacja GameEntity. */
export abstract class BaseEntity implements GameEntity {
  public position: Vector2;
  public previousPosition: Vector2;
  public velocity: Vector2 = { x: 0, y: 0 };
  public rotation: number = 0;
  public previousRotation: number = 0;
  public abstract readonly boundingBox: AABB;

  protected alive: boolean = true;

  public constructor(
    public readonly id: EntityId,
    public readonly category: EntityCategory,
    startPosition: Vector2,
  ) {
    this.position = { ...startPosition };
    this.previousPosition = { ...startPosition };
  }

  public isAlive(): boolean {
    return this.alive;
  }

  /** Wywoływane przed każdym tickiem logiki — zapisuje stan do interpolacji. */
  public savePreviousState(): void {
    this.previousPosition = { ...this.position };
    this.previousRotation = this.rotation;
  }
}
```

### `EntityManager` — rejestr bytów

```typescript
// entities/base/EntityManager.ts

import type { EntityId } from '@/types/common';
import type { GameEntity } from './GameEntity';
import type { EntityCategory } from './EntityCategory';

/**
 * Rejestr aktywnych bytów. Jeden na aktywny system gwiezdny.
 * Nie zawiera logiki aktualizacji — to rola systems/.
 */
export class EntityManager {
  private readonly entities = new Map<EntityId, GameEntity>();

  /** Dodaje byt do rejestru. */
  add(entity: GameEntity): void;

  /** Usuwa byt z rejestru (po zniszczeniu / opuszczeniu systemu). */
  remove(id: EntityId): void;

  /** Pobiera byt po id. */
  get(id: EntityId): GameEntity | undefined;

  /** Czy byt o danym id istnieje. */
  has(id: EntityId): boolean;

  /** Wszystkie aktywne byty. */
  getAll(): ReadonlyArray<GameEntity>;

  /** Byty danej kategorii. */
  getByCategory(category: EntityCategory): ReadonlyArray<GameEntity>;

  /** Usuwa byty, dla których isAlive() === false. */
  sweepDead(): void;

  /** Liczba aktywnych bytów. */
  readonly size: number;
}
```

---

## 3. Docelowe kontrakty wizualne (`presentation/`)

### Decyzja architekturalna
Warstwa prezentacji **nie importuje** klas bytów bezpośrednio. Komunikacja idzie przez interfejsy (`GameEntity`, `Renderable`). Profil wizualny jest obiektem danych, nie klasą bazową.

### Rozszerzony `Renderable`

```typescript
// types/engine.ts — ZMIANA istniejącego pliku

import type { Vector2 } from './common';
import type { EntityId } from './common';

/** Konfiguracja pętli gry przekazywana do GameLoop. */
export interface GameLoopConfig {
  tickRate: number;
  onFixedUpdate: (dt: number) => void;
  onFrameUpdate: (dt: number, alpha: number) => void;
  onFrameRender: (alpha: number) => void;
}

/**
 * Minimalny kontrakt obiektu, który może być rysowany na canvasie.
 * Rozszerzony w Etapie 3 o pola potrzebne do interpolacji, culling i cache.
 */
export interface Renderable {
  /** Powiązane ID bytu logicznego. */
  readonly entityId: EntityId;

  /** Aktualna pozycja w świecie. */
  position: Vector2;

  /** Pozycja w poprzednim ticku — do interpolacji. */
  previousPosition: Vector2;

  /** Kąt obrotu (radiany). */
  rotation: number;

  /** Kąt obrotu w poprzednim ticku. */
  previousRotation: number;

  /** Promień wynikowy do frustum culling (px w świecie). */
  readonly cullRadius: number;

  /** Czy obiekt jest widoczny (np. ukryty = zamaskowany). */
  visible: boolean;

  /** Rysuje obiekt na context. Alpha służy do interpolacji. */
  render(ctx: CanvasRenderingContext2D, alpha: number): void;
}
```

> **Uwaga:** Istniejący `Renderable` się zmienia — `position: Vector2` i `rotation: number` pozostają, ale dodane zostają pola interpolacji, `entityId`, `cullRadius`, `visible`. Metoda `render()` nie zmienia sygnatury.

### `RenderableFactory` — tworzenie obiektów wizualnych

```typescript
// presentation/renderables/RenderableFactory.ts

import type { Renderable } from '@/types/engine';
import type { GameEntity } from '@entities/base/GameEntity';
import type { VisualProfile } from '@/presentation/profiles/VisualProfile';
import type { OffscreenCache } from '@/presentation/cache/OffscreenCache';

/**
 * Tworzy Renderable na podstawie bytu i profilu wizualnego.
 * Centralne miejsce wiązania logiki z prezentacją.
 */
export class RenderableFactory {
  constructor(private readonly cache: OffscreenCache);

  /**
   * Tworzy Renderable dla danego bytu.
   * Używa profilu do określenia, jak obiekt wygląda.
   */
  create(entity: GameEntity, profile: VisualProfile): Renderable;
}
```

### `EntityRenderable` — bazowa klasa wizualna bytu

```typescript
// presentation/renderables/EntityRenderable.ts

import type { Vector2 } from '@/types/common';
import type { EntityId } from '@/types/common';
import type { Renderable } from '@/types/engine';
import type { VisualProfile } from '@/presentation/profiles/VisualProfile';
import type { OffscreenCache } from '@/presentation/cache/OffscreenCache';

/**
 * Domyślna implementacja Renderable dla bytów świata.
 * Obsługuje interpolację, culling i deleguje rysowanie do VisualProfile.
 */
export class EntityRenderable implements Renderable {
  public readonly entityId: EntityId;
  public position: Vector2;
  public previousPosition: Vector2;
  public rotation: number = 0;
  public previousRotation: number = 0;
  public readonly cullRadius: number;
  public visible: boolean = true;

  constructor(
    entityId: EntityId,
    profile: VisualProfile,
    cache: OffscreenCache,
  );

  /** Interpoluje pozycję i rotację. */
  public getInterpolatedPosition(alpha: number): Vector2;
  public getInterpolatedRotation(alpha: number): number;

  /** Synchronizuje pozycję i rotację z bytu logicznego. */
  public syncFromEntity(entity: {
    position: Vector2;
    previousPosition: Vector2;
    rotation: number;
    previousRotation: number;
  }): void;

  /** Rysuje obiekt — deleguje do profilu. */
  public render(ctx: CanvasRenderingContext2D, alpha: number): void;
}
```

### `VisualProfile` — profil wizualny bytu

```typescript
// presentation/profiles/VisualProfile.ts

import type { EntityCategory } from '@entities/base/EntityCategory';

/**
 * Profil wizualny opisuje JAK rysować byt danego typu.
 * To dane, nie logika — profil nie rysuje sam, ale dostarcza informacji
 * potrzebnych EntityRenderable do renderowania.
 */
export interface VisualProfile {
  /** Unikalna nazwa profilu (np. 'scout-mark-i', 'trading-station-alpha'). */
  readonly profileId: string;

  /** Kategoria bytu, dla którego profil jest przeznaczony. */
  readonly category: EntityCategory;

  /** Rozmiar wizualny obiektu w pikselach świata (szerokość × wysokość). */
  readonly size: { width: number; height: number };

  /** Promień do frustum culling (px świata). */
  readonly cullRadius: number;

  /**
   * Źródło grafiki — na etapie 3 tylko 'procedural'.
   * 'sprite' wejdzie w Etapie 4, gdy pojawią się assety.
   */
  readonly source: VisualSource;
}

/** Źródło grafiki profilu. */
export type VisualSource =
  | { type: 'procedural'; drawFn: ProceduralDrawFn }
  | { type: 'sprite'; url: string; frameWidth: number; frameHeight: number };

/**
 * Funkcja rysująca byt proceduralnie.
 * Rysuje w układzie lokalnym — (0,0) = centrum obiektu, ctx jest już przetransformowany.
 */
export type ProceduralDrawFn = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
) => void;
```

### `VisualProfileRegistry` — rejestr profili

```typescript
// presentation/profiles/VisualProfileRegistry.ts

import type { VisualProfile } from './VisualProfile';

/**
 * Singleton rejestr profili wizualnych.
 * Profile rejestruje się raz przy ładowaniu gry / systemu gwiezdnego.
 */
export class VisualProfileRegistry {
  private readonly profiles = new Map<string, VisualProfile>();

  /** Rejestruje profil. Rzuca błąd, jeśli profileId jest zduplikowane. */
  register(profile: VisualProfile): void;

  /** Pobiera profil po id. */
  get(profileId: string): VisualProfile | undefined;

  /** Czy profil istnieje. */
  has(profileId: string): boolean;

  /** Wszystkie zarejestrowane profile. */
  getAll(): ReadonlyArray<VisualProfile>;
}
```

---

## 4. Integracja z `WorldLayer`

### Decyzja
`WorldLayer` przechowuje listę `Renderable[]` i co klatkę rysuje widoczne obiekty z uwzględnieniem kamery i frustum culling.

### Zmieniony `WorldLayer`

```typescript
// presentation/scene/WorldLayer.ts — ZMIANA istniejącego pliku

import type { Camera } from '@engine/renderer/Camera';
import type { SceneLayer } from './SceneLayer';
import type { Renderable } from '@/types/engine';

export class WorldLayer implements SceneLayer {
  readonly order = 2;
  private renderables: Renderable[] = [];

  /** Dodaje renderable do warstwy. */
  addRenderable(r: Renderable): void;

  /** Usuwa renderable z warstwy. */
  removeRenderable(entityId: string): void;

  /** Aktualizacja warstwy (sorting, culling prep). */
  update(dt: number, camera: Camera): void;

  /** Rysuje widoczne obiekty w transformacie kamery. */
  render(ctx: CanvasRenderingContext2D, camera: Camera, alpha: number): void;
}
```

### Frustum culling

W `render()`, przed rysowaniem obiektu:

```
interpolatedPos = lerp(r.previousPosition, r.position, alpha)
screenPos = camera.worldToScreen(interpolatedPos)

widoczny = screenPos.x + cullRadius > 0
        && screenPos.x - cullRadius < viewportWidth
        && screenPos.y + cullRadius > 0
        && screenPos.y - cullRadius < viewportHeight
```

Jeśli obiekt nie jest widoczny — pomijamy `r.render()`.

### Integracja kamery

`WorldLayer.render()` stosuje `camera.applyTransform(ctx)` przed rysowaniem obiektów, a po zakończeniu resetuje transformację. `EntityRenderable.render()` rysuje w układzie lokalnym (translate + rotate jest obsługiwane przez `WorldLayer` lub przez sam `EntityRenderable` po `applyTransform`).

**Decyzja do podjęcia:** Kto robi per-object translate+rotate — WorldLayer (iteruje i ustawia transform per obiekt) czy EntityRenderable (sam stosuje translate+rotate na interpolowanych wartościach)?

Propozycja: `WorldLayer` stosuje `camera.applyTransform(ctx)` raz na początku render. Każdy `EntityRenderable.render()` sam robi translate do interpolowanej pozycji i rotate — ponieważ każdy byt może mieć specyficzne transformacje (np. oscylacja stacji).

---

## 5. Limit cache bytów (`OffscreenCache`)

### Decyzja
W Etapie 3 dodawany jest limit pamięci do `OffscreenCache`. Limit dotyczy wyłącznie cache bytów (klucze z prefiksem `entity-`). Cache tła i paralaksy nie podlega limitowi.

### Zmiana API

```typescript
// presentation/cache/OffscreenCache.ts — ROZSZERZENIE

export class OffscreenCache {
  // ... istniejące metody bez zmian ...

  /** Ustawia limit pamięci dla cache bytów (bajty). Domyślnie: 64 MB. */
  setEntityCacheLimit(bytes: number): void;

  /** Czy cache bytów przekracza limit. */
  isEntityCacheFull(): boolean;
}
```

Polityka eviction: LRU (Least Recently Used) — przy przekroczeniu limitu najdawniej użyty wpis z prefiksem `entity-` jest usuwany.

---

## 6. Lista plików — dodanie i zmiana

### Nowe pliki

| Plik | Rola |
|---|---|
| `src/entities/base/EntityCategory.ts` | Typ wyliczeniowy kategorii bytów |
| `src/entities/base/GameEntity.ts` | Bazowy interfejs bytu |
| `src/entities/base/DestroyableEntity.ts` | Interfejs bytu ze zdrowiem |
| `src/entities/base/FactionOwned.ts` | Interfejs przynależności frakcyjnej |
| `src/entities/base/BaseEntity.ts` | Abstrakcyjna klasa bazowa |
| `src/entities/base/EntityManager.ts` | Rejestr aktywnych bytów |
| `src/entities/base/index.ts` | Re-eksport publicznego API |
| `src/presentation/renderables/EntityRenderable.ts` | Bazowa klasa wizualna bytu |
| `src/presentation/renderables/RenderableFactory.ts` | Fabryka wiążąca byt z profilem |
| `src/presentation/renderables/index.ts` | Re-eksport |
| `src/presentation/profiles/VisualProfile.ts` | Interfejs profilu wizualnego |
| `src/presentation/profiles/VisualProfileRegistry.ts` | Rejestr profili |
| `src/presentation/profiles/index.ts` | Re-eksport |

### Zmieniane pliki

| Plik | Zmiana |
|---|---|
| `src/types/engine.ts` | Rozszerzenie interfejsu `Renderable` o `entityId`, `previousPosition`, `previousRotation`, `cullRadius`, `visible` |
| `src/presentation/scene/WorldLayer.ts` | Zamiana stuba na implementację z kolekcją renderables, culling, rysowaniem |
| `src/presentation/cache/OffscreenCache.ts` | Dodanie limitu pamięci bytów, LRU eviction |
| `src/app/AppShell.ts` | Dodanie `EntityManager`, `VisualProfileRegistry`, `RenderableFactory` — utworzenie instancji |

### Pliki bez zmian

| Plik | Powód |
|---|---|
| `types/common.ts` | `EntityId` i `Vector2` wystarczają |
| `physics/Vector2.ts` | Bez zmian |
| `physics/types.ts` | `AABB` wystarczy bez zmian |
| `presentation/scene/SceneLayer.ts` | Interfejs nie wymaga zmian |
| `presentation/scene/SceneRenderer.ts` | Orkiestrator nie wymaga zmian |
| `presentation/scene/BackgroundLayer.ts` | Bez zmian |
| `presentation/scene/ParallaxLayer.ts` | Bez zmian |
| `presentation/scene/DebugLayer.ts` | Bez zmian |
| `presentation/scene/EffectsLayer.ts` | Bez zmian (stub do Etapu 9) |

---

## 7. Kolejność implementacji

```
Krok 1: EntityCategory.ts
         ↓
Krok 2: GameEntity.ts → DestroyableEntity.ts → FactionOwned.ts
         ↓
Krok 3: BaseEntity.ts
         ↓
Krok 4: EntityManager.ts
         ↓
Krok 5: Rozszerzenie Renderable w types/engine.ts
         ↓
Krok 6: VisualProfile.ts → VisualProfileRegistry.ts
         ↓
Krok 7: EntityRenderable.ts
         ↓
Krok 8: RenderableFactory.ts
         ↓
Krok 9: Zmiana WorldLayer.ts (kolekcja, culling, rysowanie)
         ↓
Krok 10: Rozszerzenie OffscreenCache.ts (limit, LRU)
         ↓
Krok 11: Aktualizacja AppShell.ts (instancje EntityManager, registry, factory)
         ↓
Krok 12: Plik index.ts w entities/base/, renderables/, profiles/
```

---

## 8. Zależności od wcześniejszych etapów

| Zależność | Etap | Status |
|---|---|---|
| `EntityId`, `Vector2` | Etap 1 | ✅ Gotowe |
| `Vec2`, `AABB`, `CollisionResult` | Etap 1 | ✅ Gotowe |
| `Camera`, `Renderer` | Etap 1 | ✅ Gotowe |
| `GameLoop` (fixed + variable timestep) | Etap 1 | ✅ Gotowe |
| `SceneLayer`, `SceneRenderer` | Etap 2 | ✅ Gotowe |
| `WorldLayer` (stub) | Etap 2 | ✅ Gotowe (do zmiany w Etapie 3) |
| `OffscreenCache` | Etap 2 | ✅ Gotowe (do rozszerzenia w Etapie 3) |
| Aliasy `@entities`, `@presentation` w tsconfig/vite | Etap 1 | ⚠️ **Brak** — trzeba dodać |

### Wymagane uzupełnienia konfiguracji

Dodać aliasy do `tsconfig.json` i `vite.config.ts`:

```
"@entities/*": ["./src/entities/*"]
"@presentation/*": ["./src/presentation/*"]
```

> **Uwaga:** Alias `@presentation` nie istnieje w obecnej konfiguracji. Import `presentation/` dotychczas używał `@/presentation/` (np. w `AppShell.ts`). Decyzja: dodać dedykowany alias `@presentation` dla spójności, lub kontynuować z `@/presentation/`. Propozycja: dodać `@entities` i `@presentation` — dla spójności z `@engine`, `@physics`, `@world`.

---

## 9. Zakres poza etapem

Etap 3 **nie** obejmuje:

- Konkretnych typów bytów (statki, stacje, wrota, wraki, pociski) — to Etap 5.
- Assetów graficznych (PNG, sprite sheety) — to Etap 4.
- Konkretnych profili wizualnych (wygląd scout-a, wygląd stacji handlowej) — to Etapy 4–5.
- Mechanik gameplayowych (lot, reaktor, broń, osłony) — to Etap 6.
- HUD, menu, ekranów UI — to Etap 7.
- Efektów cząsteczkowych i wariantów wizualnych — to Etap 9.
- Systemu spawnu bytów — to Etap 5/8.
- Systemów AI i zachowań NPC.
- Kolizji między bytami (detekcja i odpowiedź) — to Etap 5/6.

---

## 10. Zadania implementacyjne

### T1. Uzupełnienie konfiguracji aliasów
- Dodać `@entities` i `@presentation` do `tsconfig.json` (paths).
- Dodać `@entities` i `@presentation` do `vite.config.ts` (resolve.alias).

### T2. Katalog `entities/base/` — interfejsy i typy
- Utworzyć `entities/base/EntityCategory.ts`.
- Utworzyć `entities/base/GameEntity.ts`.
- Utworzyć `entities/base/DestroyableEntity.ts`.
- Utworzyć `entities/base/FactionOwned.ts`.

### T3. `BaseEntity` — klasa abstrakcyjna
- Utworzyć `entities/base/BaseEntity.ts`.
- Implementuje `GameEntity`.
- Metoda `savePreviousState()`.

### T4. `EntityManager` — rejestr bytów
- Utworzyć `entities/base/EntityManager.ts`.
- Metody: `add`, `remove`, `get`, `has`, `getAll`, `getByCategory`, `sweepDead`.

### T5. Rozszerzenie `Renderable`
- Zmodyfikować `types/engine.ts`.
- Dodać: `entityId`, `previousPosition`, `previousRotation`, `cullRadius`, `visible`.

### T6. Profil wizualny
- Utworzyć `presentation/profiles/VisualProfile.ts`.
- Utworzyć `presentation/profiles/VisualProfileRegistry.ts`.

### T7. `EntityRenderable`
- Utworzyć `presentation/renderables/EntityRenderable.ts`.
- Interpolacja pozycji i rotacji.
- Delegacja rysowania do profilu.

### T8. `RenderableFactory`
- Utworzyć `presentation/renderables/RenderableFactory.ts`.
- Łączy byt z profilem, tworzy `EntityRenderable`.

### T9. `WorldLayer` — implementacja
- Zmienić stub na działającą implementację.
- Kolekcja `Renderable[]`.
- Frustum culling.
- `camera.applyTransform()` + per-object translate+rotate.
- Metody: `addRenderable()`, `removeRenderable()`.

### T10. `OffscreenCache` — limit pamięci
- Dodać pole `entityCacheLimit`.
- Dodać `setEntityCacheLimit()`, `isEntityCacheFull()`.
- Implementować LRU eviction na wpisach z prefiksem `entity-`.

### T11. Integracja z `AppShell`
- Utworzyć instancje: `EntityManager`, `VisualProfileRegistry`, `RenderableFactory`.
- W `onFixedUpdate`: wywołać `sweepDead()` na `EntityManager`.
- W `onFixedUpdate`: wywołać `savePreviousState()` na bytach przed aktualizacją logiki.
- W `onFrameUpdate`: synchronizować pozycje/rotacje renderables z bytami.

### T12. Pliki index.ts
- Utworzyć `entities/base/index.ts` — re-eksport publicznych interfejsów i klas.
- Utworzyć `presentation/renderables/index.ts`.
- Utworzyć `presentation/profiles/index.ts`.

### T13. Weryfikacja wizualna (test ręczny)
- Utworzyć **tymczasowy** test byt (np. prostokąt z proceduralnym profilem) i zaenrollować go w `EntityManager` + `WorldLayer`.
- Potwierdzić, że obiekt rysuje się na canvasie, reaguje na kamerę, znika poza frustum.
- Usunąć test byt po weryfikacji (lub zostawić jako dev tool — decyzja do podjęcia). |nie wiem gdzie go włączać wyłączać|

---

## 11. Kryteria akceptacji

### Co działa po `npm run dev`

Po uruchomieniu `npm run dev` i otwarciu `http://localhost:5173`:

1. **Tło i paralaksa bez zmian** — gwiazdy, paralaksa, debug grid działają jak w Etapie 2. |Działa|
2. **Test byt widoczny** — na canvasie widać choćby jeden proceduralnie rysowany obiekt (np. kolorowy prostokąt lub trójkąt) w centrum świata. |Działa widac trójkąt z wcieciem ktory obraca się delikatnie i przemieszcza jakby bezwładnie, mozna go sledzic kamerą|
3. **Interpolacja działa** — test byt z niezerową prędkością porusza się płynnie (brak jittera) mimo fixed timestep 30 Hz. |Działa|
4. **Culling działa** — po przesunięciu kamery daleko od test bytu, obiekt przestaje być rysowany (brak wywołania `render()`). Powrót kamery przywraca rysowanie. |nie jestem w stanie okreslic|
5. **Kamera działa z bytem** — strzałki przesuwają kamerę, obiekt przesuwa się względem tła i paralaksy zgodnie z oczekiwaniami. |Działa|
6. **EntityManager działa** — w DevTools console (lub przez dev tool) widać, że `entityManager.size === 1` (test byt), `getByCategory('ship')` zwraca tablicę 1-elementową (jeśli test byt to ship). |nie wiem jak to przetestowac sprawdzic|
7. **Brak błędów** — zero błędów w konsoli. `npm run type-check` przechodzi bez errorów. `npm run build` buduje bez błędów. |Działa|

### Artefakty zamykające Etap 3

| Artefakt | Stan |
|---|---|
| `entities/base/EntityCategory.ts` — typ | Gotowy |
| `entities/base/GameEntity.ts` — interfejs | Gotowy |
| `entities/base/DestroyableEntity.ts` — interfejs | Gotowy |
| `entities/base/FactionOwned.ts` — interfejs | Gotowy |
| `entities/base/BaseEntity.ts` — klasa abstrakcyjna | Gotowy |
| `entities/base/EntityManager.ts` — rejestr | Gotowy, testowany |
| `entities/base/index.ts` — re-eksport | Gotowy |
| `types/engine.ts` — rozszerzony `Renderable` | Gotowy, kompatybilny wstecz |
| `presentation/profiles/VisualProfile.ts` — interfejs | Gotowy |
| `presentation/profiles/VisualProfileRegistry.ts` — rejestr | Gotowy |
| `presentation/profiles/index.ts` — re-eksport | Gotowy |
| `presentation/renderables/EntityRenderable.ts` — klasa | Gotowy, interpolacja działa |
| `presentation/renderables/RenderableFactory.ts` — fabryka | Gotowy |
| `presentation/renderables/index.ts` — re-eksport | Gotowy |
| `presentation/scene/WorldLayer.ts` — implementacja | Gotowy, culling działa |
| `presentation/cache/OffscreenCache.ts` — limit | Gotowy, LRU działa |
| `app/AppShell.ts` — integracja | Gotowy, instancje podłączone |
| `tsconfig.json` — aliasy | `@entities`, `@presentation` dodane |
| `vite.config.ts` — aliasy | `@entities`, `@presentation` dodane |
| `npm run type-check` | 0 errors |
| `npm run build` | Buduje bez błędów |

### Czego NIE ma w Etapie 3

- Żadnych konkretnych typów statków, stacji, wrót itp. — tylko bazowe kontrakty.
- Żadnych assetów graficznych — obiekty testowe są proceduralne.
- Żadnej logiki gameplayowej (lot, reaktor, osłony, bronie).
- Żadnego UI, HUD, menu.
- Żadnych kolizji między bytami.
- Żadnych systemów AI.
- Żadnego spawnu bytów (ręczne dodanie test bytu to nie spawn system).

---

## 12. Otwarte decyzje do podjęcia

| # | Decyzja | Propozycja | Status | Pytanie/odpowiedź | Decyzja |
|---|---|---|---|---|---|
| D1 | Kto robi per-object translate+rotate: WorldLayer czy EntityRenderable? | EntityRenderable — elastyczność per-byt. | Zatwierdzone | czy EntityRenderable — elastyczność per-byt. nie jest lepsze? ogolnie kazdy system bedzie customowy. czyli bedzie mial okreslony wyglad ciala niebieskie stacje i rodzaje statkow ktore beda sie w nim pojawiac. Taki mam plan| Obecnie wykonane z planem jaki chce |
| D2 | Czy test byt z T13 zostawić jako dev tool, czy usunąć po weryfikacji? | Zostawić jako opcjonalny dev tool (flaga debug). | Zatwierdzone | zostawił bym do debug jak juz ogarne jak on dziala i gdzie go włączać i wyłączać| Do wykonania na etapie 3.5 |
| D3 | Aliasy: dodać `@entities` i `@presentation` czy używać `@/entities/` i `@/presentation/`? | Dodać dedykowane aliasy — spójność z `@engine`, `@physics`. | Zatwierdzone | potrzebuje wyjasnienia| Wykonane zgodnie z planem |
| D4 | Limit cache bytów: 64 MB domyślnie czy inna wartość? | 64 MB — bezpieczny margines. | Zatwierdzone | dajmy limit tych 64 MB ale z mozliwoscią dostosowania. Musze to łatwo znaleźć w kodzie oraz wiedzieć ile obecnie MB jest wykorzystane | Do wykonania na etapie 3.5 |
| D5 | Czy `EntityManager.getByCategory()` zwraca kopię tablicy czy widok? | Kopię (filtrowany `Array.from`) — bezpieczeństwo nad wydajnością na tym etapie. | Zatwierdzone | Nie zabardzo rozumiem | Wykonane w bezpieczny sposob, zwraca tablice, a nie zywy widok | 

---

## Struktura plików Etapu 3

```
src/
├── entities/
│   └── base/
│       ├── EntityCategory.ts       ← typ kategorii bytów
│       ├── GameEntity.ts           ← bazowy interfejs
│       ├── DestroyableEntity.ts    ← interfejs bytu ze zdrowiem
│       ├── FactionOwned.ts         ← interfejs przynależności
│       ├── BaseEntity.ts           ← klasa abstrakcyjna
│       ├── EntityManager.ts        ← rejestr bytów
│       └── index.ts                ← re-eksport
├── presentation/
│   ├── renderables/
│   │   ├── EntityRenderable.ts     ← bazowa klasa wizualna
│   │   ├── RenderableFactory.ts    ← fabryka
│   │   └── index.ts                ← re-eksport
│   ├── profiles/
│   │   ├── VisualProfile.ts        ← interfejs profilu
│   │   ├── VisualProfileRegistry.ts ← rejestr profili
│   │   └── index.ts                ← re-eksport
│   ├── scene/
│   │   └── WorldLayer.ts           ← ZMIANA: kolekcja + culling + rysowanie
│   └── cache/
│       └── OffscreenCache.ts       ← ZMIANA: limit + LRU
└── types/
    └── engine.ts                   ← ZMIANA: rozszerzony Renderable
```

---

## Podsumowanie zmian do istniejących dokumentów

| Dokument | Zmiana |
|---|---|
| `02_gameplay-domeny.md` | Dodać link: „Kontrakty bazowe bytów: `08_etap3-specyfikacja.md`". |
| `04_presentation-assets.md` | Dodać link: „Kontrakty renderables i profiles: `08_etap3-specyfikacja.md`". |
| `05_plan-prac.md` | Dodać link do definicji done: „Kryteria zamknięcia Etapu 3: `08_etap3-specyfikacja.md`, sekcja 11". |
| `07_etap2-specyfikacja.md` | Bez zmian. |
