# Etap 3.5 — Dev Overlay Panel

## Cel

Jeden panel debug po prawej stronie ekranu, zwijany i rozwijany, z metrykami runtime.
Eliminuje konieczność grzebania w konsoli DevTools przy każdej iteracji.
Buduje na fundamencie Etapów 1–3 (AppShell, GameLoop, Camera, EntityManager, WorldLayer, OffscreenCache).

Etap 3.5 dostarcza:
1. **Dev Overlay Panel** — panel HTML dokowany po prawej stronie z metrykami aktualizowanymi z throttle 4 Hz (co 250 ms).
2. **Rozszerzalny system sekcji** — API `registerSection` / `registerMetric` umożliwiające dopinanie nowych danych w kolejnych etapach bez przebudowy panelu.
3. **Toggle test bytu** — przeniesienie flagi `DEV_TEST_ENTITY_ENABLED` z hardcodu do panelu (checkbox + `localStorage`).
4. **Refaktor `OffscreenCache.ts`** — rozbicie 3 odpowiedzialności na mniejsze pliki (fasada, budżet pamięci, LRU index, typy wpisów).

---

## 1. Stan obecny

### Co istnieje

| Element | Lokalizacja | Status |
|---|---|---|
| `EntityManager` | `entities/base/EntityManager.ts` | Zaimplementowany — `size`, `getAll()`, `getByCategory()` |
| `WorldLayer` | `presentation/scene/WorldLayer.ts` | Zaimplementowany — `renderables[]`, frustum culling |
| `OffscreenCache` | `presentation/cache/OffscreenCache.ts` | Zaimplementowany — API cache, limit bytów, LRU eviction, 144 linie, 3 odpowiedzialności w jednym pliku |
| `Camera` | `engine/renderer/Camera.ts` | Zaimplementowana — `position`, `zoom` |
| `AppShell` | `app/AppShell.ts` | Zaimplementowany — `DEV_TEST_ENTITY_ENABLED` jako hardkodowana stała `true` |
| `DebugLayer` | `presentation/scene/DebugLayer.ts` | Zaimplementowana — toggle klawiszem `G` |
| Dev Overlay Panel | nie istnieje | Brak katalogu i plików |

### Czego brakuje

1. **Brak panelu debug** — jedyny sposób podglądu stanu to `console.log` lub ręczne wpisywanie `__dev.entityManager.size` w konsoli.
2. **Brak widocznych metryk runtime** — nie widać: ile bytów jest aktywnych, ile renderables jest widocznych vs culled, jaka jest pozycja kamery, ile MB cache jest wykorzystane.
3. **Toggle test bytu** — flaga `DEV_TEST_ENTITY_ENABLED` jest stałą w kodzie; zmiana wymaga edycji pliku i przeładowania.
4. **`OffscreenCache.ts` miesza 3 odpowiedzialności** — API cache, budżet pamięci bytów, LRU eviction — co utrudnia testy jednostkowe i dodanie metryk MB do panelu.
5. **Brak infra na kolejne panele debug** — nie ma mechanizmu, który pozwoli Etapom 4–9 dodawać własne sekcje bez modyfikacji istniejącego kodu panelu.

---

## 2. Dev Overlay Panel — UI

### Wygląd i pozycjonowanie

```
┌──────────────────────────────────────────────────────────────────────┐
│                         GAME CANVAS                                  │
│                                                                      │
│                                              ┌──────────────────┐   │
│                                              │ ▼ Dev Panel   [×] │   │
│                                              ├──────────────────┤   │
│                                              │ ▼ Entities       │   │
│                                              │   total: 1       │   │
│                                              │   ship: 1        │   │
│                                              │   station: 0     │   │
│                                              ├──────────────────┤   │
│                                              │ ▼ Render         │   │
│                                              │   renderables: 1 │   │
│                                              │   visible: 1     │   │
│                                              │   culled: 0      │   │
│                                              ├──────────────────┤   │
│                                              │ ▼ Camera         │   │
│                                              │   x: 120.5       │   │
│                                              │   y: 43.2        │   │
│                                              │   zoom: 1.00     │   │
│                                              ├──────────────────┤   │
│                                              │ ▼ Cache          │   │
│                                              │   used: 2.4 MB   │   │
│                                              │   limit: 64 MB   │   │
│                                              │   percent: 3.8%  │   │
│                                              ├──────────────────┤   │
│                                              │ ▼ Dev Flags      │   │
│                                              │   ☑ Test entity  │   │
│                                              └──────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Parametry CSS

| Parametr | Wartość |
|---|---|
| Pozycja | `position: fixed`, prawa krawędź, pionowo wyśrodkowany (`top: 50%; transform: translateY(-50%)`) |
| Szerokość | `320px` (stała) |
| Maksymalna wysokość | `33vh` |
| Overflow | `overflow-y: auto` (scroll gdy sekcji jest dużo) |
| Z-index | `9999` (ponad wszystkim, także `#screen-layer`) |
| Tło | Ciemne półprzezroczyste (`rgba(10, 10, 20, 0.88)`, `backdrop-filter: blur(4px)`) |
| Font | Monospace, 12px |
| Ramka | `1px solid rgba(255, 255, 255, 0.12)` |
| Zaokrąglenie | `8px` (lewy-górny i lewy-dolny narożnik) |
| Pointer events | `pointer-events: auto` (panel klikalny) |
| Przycisk collapse | `[▲/▼]` w nagłówku — zwijanie panelu do samego nagłówka |

### Style

```css
/* src/dev/styles/dev-overlay.css */

.dev-overlay {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 320px;
  max-height: 33vh;
  overflow-y: auto;
  z-index: 9999;
  background: rgba(10, 10, 20, 0.88);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: #c8c8d0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.5;
  pointer-events: auto;
  user-select: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dev-overlay--collapsed {
  max-height: none;
  overflow: visible;
}

.dev-overlay__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  font-weight: bold;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9090a0;
}

.dev-overlay__header:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dev-overlay__body {
  padding: 4px 0;
}

.dev-overlay__section {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.dev-overlay__section:last-child {
  border-bottom: none;
}

.dev-overlay__section-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 11px;
  color: #8888a0;
}

.dev-overlay__section-header:hover {
  color: #aaaacc;
}

.dev-overlay__section-body {
  padding: 2px 10px 6px 18px;
}

.dev-overlay__metric {
  display: flex;
  justify-content: space-between;
  padding: 1px 0;
}

.dev-overlay__metric-label {
  color: #8080a0;
}

.dev-overlay__metric-value {
  color: #e0e0f0;
  font-weight: bold;
}

.dev-overlay__checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  cursor: pointer;
}

.dev-overlay__checkbox input[type='checkbox'] {
  accent-color: #2ec4b6;
  cursor: pointer;
}
```

---

## 3. Toggle — skrót klawiaturowy + flaga startowa

### Skrót klawiaturowy

Klawisz **6** przełącza widoczność panelu (`display: none` ↔ `display: block`).

Listener na `keydown` na `window`, **niezależny** od `InputModeManager` — panel debug działa zawsze, niezależnie od trybu `game`/`ui`.

### Flaga startowa

Panel respektuje flagę `localStorage`:

```
localStorage.setItem('dev-overlay', 'true');  // panel widoczny po starcie
localStorage.setItem('dev-overlay', 'false'); // panel ukryty po starcie
```

Domyślna wartość (brak klucza w `localStorage`): **`true`** (widoczny) — wygodniejsze podczas developmentu.

Dodatkowo obsługiwany query param: `?dev-overlay=true` lub `?dev-overlay=false` — nadpisuje `localStorage`.

### Test entity toggle

Flaga test bytu:
- `localStorage` klucz: `dev-test-entity`
- Domyślna wartość: `true`
- Zmiana w panelu (checkbox) zapisuje do `localStorage` i natychmiast dodaje/usuwa test byt z `EntityManager` + `WorldLayer` (bez przeładowania strony).
- Z AppShell usunięta hardkodowana stała `DEV_TEST_ENTITY_ENABLED`.

---

## 4. API rozszerzalności — `DevOverlayPanel`

### Decyzja architekturalna

Panel jest klasą zarządzającą DOM-em i odświeżaną z throttle 4 Hz (co 250 ms). Sekcje rejestruje się programowo przez API — nowe etapy dodają sekcje bez modyfikacji kodu panelu.

### `DevOverlayPanel`

```typescript
// dev/DevOverlayPanel.ts

/**
 * Dev Overlay Panel — panel debug z metrykami runtime.
 * Rejestr sekcji i metryk, odświeżany z throttle 4 Hz (co 250 ms).
 */
export class DevOverlayPanel {
  private readonly root: HTMLDivElement;
  private readonly sections: Map<string, DevSection>;
  private visible: boolean;

  constructor();

  /** Montuje panel do DOM. */
  mount(parent: HTMLElement): void;

  /** Odmontowuje panel z DOM. */
  unmount(): void;

  /** Przełącza widoczność. */
  toggle(): void;

  /** Ustawia widoczność. */
  setVisible(visible: boolean): void;

  /** Czy panel jest widoczny. */
  isVisible(): boolean;

  /**
   * Rejestruje nową sekcję.
   * @param id - unikalny identyfikator sekcji (np. 'entities', 'render').
   * @param label - etykieta wyświetlana w nagłówku sekcji.
   * @returns DevSection — obiekt sekcji do dodawania metryk.
   */
  registerSection(id: string, label: string): DevSection;

  /** Usuwa sekcję. */
  removeSection(id: string): void;

  /** Pobiera sekcję po id. */
  getSection(id: string): DevSection | undefined;

  /** Aktualizuje wszystkie sekcje — wywoływane z throttle 4 Hz (co 250 ms). */
  update(): void;
}
```

### `DevSection`

```typescript
// dev/DevSection.ts

/**
 * Sekcja panelu debug — grupa powiązanych metryk.
 */
export class DevSection {
  readonly id: string;
  readonly label: string;
  private collapsed: boolean;
  private readonly metrics: Map<string, DevMetric>;
  private readonly controls: Map<string, DevControl>;

  constructor(id: string, label: string);

  /**
   * Rejestruje metrykę wyświetlaną jako label: value.
   * @param id - unikalny identyfikator metryki w sekcji.
   * @param label - etykieta metryki.
   * @param getter - funkcja zwracająca aktualną wartość (odpytywana przy aktualizacji panelu 4 Hz).
   */
  registerMetric(id: string, label: string, getter: () => string | number): void;

  /** Usuwa metrykę. */
  removeMetric(id: string): void;

  /**
   * Rejestruje kontrolę (np. checkbox).
   * @param id - unikalny identyfikator kontroli.
   * @param label - etykieta.
   * @param type - typ kontroli ('checkbox').
   * @param initialValue - wartość początkowa.
   * @param onChange - callback przy zmianie.
   */
  registerControl(
    id: string,
    label: string,
    type: 'checkbox',
    initialValue: boolean,
    onChange: (value: boolean) => void,
  ): void;

  /** Aktualizuje widżety sekcji — wywoływane przez panel z throttle 4 Hz (co 250 ms). */
  update(): void;

  /** Przełącza zwinięcie sekcji. */
  toggleCollapse(): void;

  /** Buduje/aktualizuje DOM sekcji. */
  render(container: HTMLElement): void;
}
```

### `DevMetric` i `DevControl` — typy wewnętrzne

```typescript
// dev/types.ts

/** Metryka odczytowa — label + dynamiczna wartość. */
export interface DevMetric {
  id: string;
  label: string;
  getter: () => string | number;
  element?: HTMLElement;
}

/** Kontrola interaktywna (checkbox, slider, button w przyszłości). */
export interface DevControl {
  id: string;
  label: string;
  type: 'checkbox';
  value: boolean;
  onChange: (value: boolean) => void;
  element?: HTMLElement;
}
```

---

## 5. Domyślne sekcje

### Sekcja: Entities

| Metryka | Getter | Format |
|---|---|---|
| `total` | `entityManager.size` | liczba |
| `ship` | `entityManager.getByCategory('ship').length` | liczba |
| `station` | `entityManager.getByCategory('station').length` | liczba |
| `gate` | `entityManager.getByCategory('gate').length` | liczba |
| `wreck` | `entityManager.getByCategory('wreck').length` | liczba |
| `projectile` | `entityManager.getByCategory('projectile').length` | liczba |
| `celestial` | `entityManager.getByCategory('celestial').length` | liczba |
| `environment` | `entityManager.getByCategory('environment').length` | liczba |

> **Uwaga:** Kategorie z liczbą 0 mogą być ukrywane lub wyszarzane — decyzja implementacyjna.

### Sekcja: Render

| Metryka | Getter | Format |
|---|---|---|
| `renderables` | `worldLayer.renderableCount` | liczba |
| `visible` | `worldLayer.lastVisibleCount` | liczba |
| `culled` | `renderables - visible` | liczba |

> **Wymaga rozszerzenia `WorldLayer`** — dodanie getterów `renderableCount` i `lastVisibleCount`. `lastVisibleCount` jest ustawiany w `render()` po obliczeniu culling.

### Sekcja: Camera

| Metryka | Getter | Format |
|---|---|---|
| `x` | `camera.position.x` | `toFixed(1)` |
| `y` | `camera.position.y` | `toFixed(1)` |
| `zoom` | `camera.zoom` | `toFixed(2)` |

### Sekcja: Cache

| Metryka | Getter | Format |
|---|---|---|
| `used` | `cache.entityCacheBytes / (1024*1024)` | `N.N MB` |
| `limit` | `cache.entityCacheLimit / (1024*1024)` | `N MB` |
| `percent` | `(entityCacheBytes / entityCacheLimit) * 100` | `N.N%` |
| `entries` | `cache.size` | liczba |

> **Wymaga publicznych getterów w `OffscreenCache`** — `entityCacheBytes` i `entityCacheLimit` powinny być dostępne odczytowo (read-only). Po refaktorze: z `EntityCacheBudget`.

### Sekcja: Dev Flags

| Kontrola | Typ | Persistence | Efekt |
|---|---|---|---|
| Test entity | checkbox | `localStorage('dev-test-entity')` | Dodaje/usuwa test byt w runtime |

---

## 6. Refaktor `OffscreenCache.ts`

### Obecny stan

Plik `OffscreenCache.ts` (144 linie) łączy 3 odpowiedzialności:
1. **API cache** — `getOrCreate()`, `invalidate()`, `clear()`, `size`, `estimatedBytes`.
2. **Budżet pamięci bytów** — `entityCacheLimit`, `entityCacheBytes`, `setEntityCacheLimit()`, `isEntityCacheFull()`.
3. **LRU eviction** — `entityAccess`, `entityAccessCounter`, `touchEntityKey()`, `evictEntityCacheIfNeeded()`.

### Proponowany podział

```
presentation/cache/
├── OffscreenCache.ts          ← fasada (uproszczona, deleguje do poniższych)
├── EntityCacheBudget.ts       ← budżet pamięci: limit MB, szacowanie rozmiaru, publiczne gettery
├── EntityLruIndex.ts          ← indeks LRU: touch, evict, najstarszy klucz
├── cacheTypes.ts              ← typy wpisów cache (CacheEntry, klucze)
└── README.md                  ← opis modułu (aktualizacja)
```

### `cacheTypes.ts`

```typescript
// presentation/cache/cacheTypes.ts

/** Wpis w cache — offscreen canvas z metadanymi rozmiaru. */
export interface CacheEntry {
  canvas: OffscreenCanvas;
  width: number;
  height: number;
}

/** Prefiks klucza bytów — cache bytów podlega limitowi i LRU. */
export const ENTITY_KEY_PREFIX = 'entity-';

/** Sprawdza, czy klucz to klucz bytu. */
export function isEntityKey(key: string): boolean {
  return key.startsWith(ENTITY_KEY_PREFIX);
}

/** Szacuje rozmiar wpisu w bajtach (RGBA, 4 bajty na piksel). */
export function estimateEntryBytes(width: number, height: number): number {
  return width * height * 4;
}
```

### `EntityCacheBudget.ts`

```typescript
// presentation/cache/EntityCacheBudget.ts

/**
 * Zarządza budżetem pamięci cache bytów.
 * Nie zarządza samym cache — tylko liczy bajty i sprawdza limit.
 */
export class EntityCacheBudget {
  private limit: number;
  private usedBytes: number = 0;

  constructor(limitBytes: number = 64 * 1024 * 1024);

  /** Ustawia limit (bajty). */
  setLimit(bytes: number): void;

  /** Aktualny limit (bajty) — read-only. */
  getLimit(): number;

  /** Aktualnie zużyte bajty — read-only. */
  getUsedBytes(): number;

  /** Procent wykorzystania (0–100). */
  getUsagePercent(): number;

  /** Czy przekroczony limit. */
  isFull(): boolean;

  /** Dodaj bajty (po dodaniu wpisu bytu). */
  add(bytes: number): void;

  /** Odejmij bajty (po usunięciu wpisu bytu). */
  subtract(bytes: number): void;

  /** Resetuje licznik do 0. */
  reset(): void;
}
```

### `EntityLruIndex.ts`

```typescript
// presentation/cache/EntityLruIndex.ts

/**
 * Indeks LRU dla kluczy cache bytów.
 * Śledzi kolejność dostępu i zwraca najstarszy klucz do eviction.
 */
export class EntityLruIndex {
  private counter: number = 0;
  private readonly accessMap = new Map<string, number>();

  /** Aktualizuje timestamp dostępu klucza. */
  touch(key: string): void;

  /** Usuwa klucz z indeksu. */
  remove(key: string): void;

  /** Zwraca klucz z najstarszym dostępem (LRU). undefined jeśli pusty. */
  getLruKey(): string | undefined;

  /** Czyści cały indeks. */
  clear(): void;

  /** Ile kluczy jest w indeksie. */
  readonly size: number;
}
```

### `OffscreenCache.ts` — po refaktorze (fasada)

```typescript
// presentation/cache/OffscreenCache.ts — UPROSZCZONA FASADA

import { EntityCacheBudget } from './EntityCacheBudget';
import { EntityLruIndex } from './EntityLruIndex';
import type { CacheEntry } from './cacheTypes';
import { isEntityKey, estimateEntryBytes } from './cacheTypes';

export class OffscreenCache {
  private readonly cache = new Map<string, CacheEntry>();
  public readonly entityBudget = new EntityCacheBudget();
  private readonly lruIndex = new EntityLruIndex();

  // ... publiczne API bez zmian (getOrCreate, invalidate, clear, size, estimatedBytes) ...
  // ... wewnętrzna logika deleguje do entityBudget i lruIndex ...

  /** Ustawia limit pamięci dla cache bytów (bajty). */
  setEntityCacheLimit(bytes: number): void;

  /** Czy cache bytów przekracza limit. */
  isEntityCacheFull(): boolean;

  // Publiczne gettery dla panelu dev:
  /** Ile bajtów cache bytów jest wykorzystane. */
  get entityCacheBytes(): number;

  /** Aktualny limit cache bytów (bajty). */
  get entityCacheLimit(): number;
}
```

> **Pole `entityBudget`** jest publiczne celowo — panel dev może bezpośrednio odczytywać metryki bez duplikacji getterów. Alternatywnie: gettery w `OffscreenCache` delegujące do `entityBudget`.

### Kompatybilność wsteczna

Publiczne API `OffscreenCache` **nie zmienia sygnatur**:
- `getOrCreate()` — bez zmian
- `invalidate()` — bez zmian
- `clear()` — bez zmian
- `setEntityCacheLimit()` — bez zmian
- `isEntityCacheFull()` — bez zmian
- `size` — bez zmian
- `estimatedBytes` — bez zmian

Żaden konsument nie wymaga zmian.

---

## 7. Rozszerzenie `WorldLayer`

### Nowe gettery (publiczne, read-only)

```typescript
// presentation/scene/WorldLayer.ts — ROZSZERZENIE

export class WorldLayer implements SceneLayer {
  // ... istniejący kod bez zmian ...

  /** Łączna liczba zarejestrowanych renderables. */
  get renderableCount(): number;

  /** Ile renderables było widocznych w ostatniej klatce render(). */
  get lastVisibleCount(): number;

  /** Ile renderables było culled w ostatniej klatce. */
  get lastCulledCount(): number;
}
```

`lastVisibleCount` jest ustawiany w `render()` — po pętli culling inkrementuje się licznik widocznych. Wynik jest dostępny między klatkami.

---

## 8. Integracja z `AppShell`

### Zmiany w `AppShell.ts`

1. **Import i instancja** — `DevOverlayPanel` tworzony w konstruktorze.
2. **Rejestracja sekcji** — domyślne sekcje (Entities, Render, Camera, Cache, Dev Flags) rejestrowane w konstruktorze.
3. **Aktualizacja panelu 4 Hz** — `devOverlay.update()` wywoływane przez mechanizm throttle co 250 ms (nie co klatkę).
4. **Toggle 6** — listener `keydown` na `window` (niezależny od `InputModeManager`).
5. **Test entity toggle** — przeniesiony z hardkodowanej stałej do checkboxa w sekcji "Dev Flags" z persystencją w `localStorage`.
6. **Usunięcie** — `DEV_TEST_ENTITY_ENABLED` usunięta jako stała; czytana z `localStorage`.

### Schemat integracji

```
constructor():
  this.devOverlay = new DevOverlayPanel();
  this.devOverlay.mount(document.body);

  // sekcje:
  const entitiesSection = this.devOverlay.registerSection('entities', 'Entities');
  entitiesSection.registerMetric('total', 'total', () => this.entityManager.size);
  entitiesSection.registerMetric('ship', 'ship', () => ...);
  // ... pozostałe kategorie

  const renderSection = this.devOverlay.registerSection('render', 'Render');
  renderSection.registerMetric('renderables', 'renderables', () => this.worldLayer.renderableCount);
  renderSection.registerMetric('visible', 'visible', () => this.worldLayer.lastVisibleCount);
  renderSection.registerMetric('culled', 'culled', () => ...);

  const cameraSection = this.devOverlay.registerSection('camera', 'Camera');
  cameraSection.registerMetric('x', 'x', () => this.camera.position.x.toFixed(1));
  cameraSection.registerMetric('y', 'y', () => this.camera.position.y.toFixed(1));
  cameraSection.registerMetric('zoom', 'zoom', () => this.camera.zoom.toFixed(2));

  const cacheSection = this.devOverlay.registerSection('cache', 'Cache');
  cacheSection.registerMetric('used', 'used', () => formatMB(this.cache.entityCacheBytes));
  cacheSection.registerMetric('limit', 'limit', () => formatMB(this.cache.entityCacheLimit));
  cacheSection.registerMetric('percent', 'percent', () => ...);

  const devFlagsSection = this.devOverlay.registerSection('dev-flags', 'Dev Flags');
  devFlagsSection.registerControl('test-entity', 'Test entity', 'checkbox',
    readLocalStorageBool('dev-test-entity', true),
    (enabled) => { ... toggle test entity ... }
  );

  window.addEventListener('keydown', (e) => {
    if (e.key === '6') { e.preventDefault(); this.devOverlay.toggle(); }
  });

onFrameUpdate():
  // ... istniejący kod ...
  this.devOverlay.update();
```

---

## 9. Lista plików — dodanie i zmiana

### Nowe pliki

| Plik | Rola |
|---|---|
| `src/dev/DevOverlayPanel.ts` | Klasa panelu — zarządzanie DOM, sekcjami, widocznością |
| `src/dev/DevSection.ts` | Klasa sekcji — metryki, kontrole, render DOM |
| `src/dev/types.ts` | Typy: `DevMetric`, `DevControl` |
| `src/dev/index.ts` | Re-eksport publicznego API |
| `src/dev/styles/dev-overlay.css` | Style panelu |
| `src/presentation/cache/cacheTypes.ts` | Typy wpisów cache, helpery (`isEntityKey`, `estimateEntryBytes`) |
| `src/presentation/cache/EntityCacheBudget.ts` | Budżet pamięci cache bytów |
| `src/presentation/cache/EntityLruIndex.ts` | Indeks LRU |

### Zmieniane pliki

| Plik | Zmiana |
|---|---|
| `src/presentation/cache/OffscreenCache.ts` | Refaktor: delegacja do `EntityCacheBudget` i `EntityLruIndex`, publiczne gettery `entityCacheBytes` i `entityCacheLimit` |
| `src/presentation/scene/WorldLayer.ts` | Dodanie getterów: `renderableCount`, `lastVisibleCount`, `lastCulledCount`; zliczanie w `render()` |
| `src/app/AppShell.ts` | Import `DevOverlayPanel`, tworzenie instancji, rejestracja sekcji, toggle 6, migr. test entity do `localStorage` |
| `src/main.ts` | Dynamiczny import stylu dev overlay tylko w dev mode |

### Pliki bez zmian

| Plik | Powód |
|---|---|
| `entities/base/*` | Kontrakty bytów nie wymagają zmian |
| `presentation/renderables/*` | Renderables nie wymagają zmian |
| `presentation/profiles/*` | Profile nie wymagają zmian |
| `presentation/scene/BackgroundLayer.ts` | Bez zmian |
| `presentation/scene/ParallaxLayer.ts` | Bez zmian |
| `presentation/scene/DebugLayer.ts` | Bez zmian |
| `presentation/scene/SceneRenderer.ts` | Bez zmian |
| `types/engine.ts` | Bez zmian |
| `types/common.ts` | Bez zmian |

---

## 10. Kolejność implementacji

```
Krok 1: cacheTypes.ts
         ↓
Krok 2: EntityCacheBudget.ts
         ↓
Krok 3: EntityLruIndex.ts
         ↓
Krok 4: Refaktor OffscreenCache.ts (delegacja do nowych klas)
         ↓
Krok 5: Rozszerzenie WorldLayer.ts (gettery renderableCount, lastVisibleCount)
         ↓
Krok 6: dev/types.ts
         ↓
Krok 7: dev/DevSection.ts
         ↓
Krok 8: dev/DevOverlayPanel.ts
         ↓
Krok 9: dev/index.ts
         ↓
Krok 10: src/dev/styles/dev-overlay.css
         ↓
Krok 11: Aktualizacja AppShell.ts (instancja panelu, sekcje, toggle, migracja test entity)
         ↓
Krok 12: Aktualizacja main.ts (dynamiczny import CSS tylko w dev mode)
         ↓
Krok 13: Konfiguracja aliasów (jeśli @dev nie istnieje — dodać do tsconfig + vite)
```

---

## 11. Zależności od wcześniejszych etapów

| Zależność | Etap | Status |
|---|---|---|
| `EntityManager` (size, getByCategory) | Etap 3 | ✅ Gotowe |
| `WorldLayer` (renderables, culling) | Etap 3 | ✅ Gotowe |
| `OffscreenCache` (limit, LRU) | Etap 3 | ✅ Gotowe (do refaktoru w 3.5) |
| `Camera` (position, zoom) | Etap 1 | ✅ Gotowe |
| `AppShell` (orkiestracja) | Etap 1 | ✅ Gotowe |
| `GameLoop` (onFrameUpdate callback) | Etap 1 | ✅ Gotowe |
| `styles/` (import CSS w main.ts) | Etap 2 | ✅ Gotowe |

### Wymagane uzupełnienia konfiguracji

Dodać alias `@dev` do `tsconfig.json` i `vite.config.ts`:

```
"@dev/*": ["./src/dev/*"]
```

### Zasady środowiskowe (dev/prod)

1. Warunek środowiska: panel działa tylko gdy `import.meta.env.DEV === true`.
2. Import stylu dev overlay również tylko w dev (dynamicznie), żeby nie trafił do produkcyjnego bundle.
3. W prod brak efektu ubocznego: brak listenera klawisza, brak DOM panelu, brak CSS panelu.

---

## 12. Zakres poza etapem

Etap 3.5 **nie** obejmuje:

- Zaawansowanych widgetów panelu (grafy FPS, histogramy, timeline) — to potencjalne rozszerzenie Etapu 9.
- Pełnego systemu konfiguracji runtime (engine settings panel) — to odległa przyszłość.
- Testów jednostkowych `DevOverlayPanel` — to nie jest logika biznesowa.
- Profilowania pamięci poza cache bytów (WebGL, audio buffers etc.).
- Persystencji stanu sekcji (collapse/expand) w `localStorage` — opcjonalne.

---

## 13. Zadania implementacyjne

### T1. Refaktor `OffscreenCache` — typy
- Utworzyć `presentation/cache/cacheTypes.ts`.
- Przenieść `isEntityKey()`, `estimateEntryBytes()` z `OffscreenCache`.
- Zdefiniować `CacheEntry` interface.

### T2. Refaktor `OffscreenCache` — budżet
- Utworzyć `presentation/cache/EntityCacheBudget.ts`.
- Przenieść logikę limitu, `usedBytes`, `isFull()`, `setLimit()`.
- Dodać gettery: `getUsedBytes()`, `getLimit()`, `getUsagePercent()`.

### T3. Refaktor `OffscreenCache` — LRU
- Utworzyć `presentation/cache/EntityLruIndex.ts`.
- Przenieść logikę `accessMap`, `counter`, `touch()`, `getLruKey()`.

### T4. Refaktor `OffscreenCache` — fasada
- Uprościć `OffscreenCache.ts` — delegacja do `EntityCacheBudget` i `EntityLruIndex`.
- Publiczne API bez zmian.
- Dodać publiczne read-only gettery `entityCacheBytes` i `entityCacheLimit`.

### T5. Rozszerzenie `WorldLayer`
- Dodać prywatne pole `_lastVisibleCount`.
- W `render()`: zliczać widoczne obiekty.
- Dodać publiczne gettery: `renderableCount`, `lastVisibleCount`, `lastCulledCount`.

### T6. Typy panelu dev
- Utworzyć `dev/types.ts` — `DevMetric`, `DevControl`.

### T7. `DevSection`
- Utworzyć `dev/DevSection.ts`.
- Metody: `registerMetric()`, `removeMetric()`, `registerControl()`, `update()`, `render()`, `toggleCollapse()`.

### T8. `DevOverlayPanel`
- Utworzyć `dev/DevOverlayPanel.ts`.
- Metody: `mount()`, `unmount()`, `toggle()`, `setVisible()`, `registerSection()`, `removeSection()`, `getSection()`, `update()`.
- Collapse/expand nagłówek.
- `localStorage` persist widoczności.

### T9. Style panelu
- Utworzyć `src/dev/styles/dev-overlay.css`.
- Ciemne półprzezroczyste tło, monospace font, sekcje z borderami.

### T10. Integracja z `AppShell`
- Import `DevOverlayPanel`, tworzenie instancji w konstruktorze.
- Rejestracja 5 domyślnych sekcji (Entities, Render, Camera, Cache, Dev Flags).
- Toggle 6 na `window.keydown`.
- Migracja test entity z `DEV_TEST_ENTITY_ENABLED` stałej do `localStorage` + checkbox w panelu.
- `devOverlay.update()` w `onFrameUpdate`.

### T11. Import CSS
- Dodać dynamiczny import `@dev/styles/dev-overlay.css` tylko gdy `import.meta.env.DEV === true`.

### T12. Konfiguracja aliasu
- Dodać `@dev` do `tsconfig.json` i `vite.config.ts`.

### T13. Re-eksport
- Utworzyć `dev/index.ts`.

### T14. Weryfikacja ręczna
- Uruchomić `npm run dev`.
- Sprawdzić, że panel jest widoczny po prawej stronie.
- Sprawdzić, że 6 przełącza widoczność.
- Sprawdzić, że metryki się aktualizują (kamera, entity count).
- Sprawdzić, że checkbox test entity działa (dodaje/usuwa trójkąt).
- Sprawdzić, że po przeładowaniu strony stan test entity i widoczność panelu są odtwarzane z `localStorage`.
- `npm run type-check` — 0 errors.
- `npm run build` — buduje bez błędów.
- Sprawdzić build produkcyjny: brak CSS i kodu panelu dev w produkcji (panel nie montuje się po uruchomieniu artefaktu prod).

---

## 14. Kryteria akceptacji

### Co działa po `npm run dev`

Po uruchomieniu `npm run dev` i otwarciu `http://localhost:5173`:

1. **Panel widoczny** — po prawej stronie ekranu widać półprzezroczysty panel z 5 sekcjami (Entities, Render, Camera, Cache, Dev Flags).
2. **Metryki aktualizowane** — pozycja kamery zmienia się na żywo przy ruchu strzałkami. Entity count = 1 (test byt). Render visible zmienia się po oddaleniu kamery od bytu.
3. **6 toggle** — wciśnięcie 6 ukrywa/pokazuje panel. Stan zapisywany w `localStorage`.
4. **Collapse/expand** — kliknięcie nagłówka panelu zwija panel do samego nagłówka. Kliknięcie nagłówka sekcji zwija sekcję.
5. **Test entity checkbox** — odznaczenie checkboxa "Test entity" usuwa trójkąt z canvasu. Zaznaczenie przywraca go. Stan persystowany w `localStorage`.
6. **Cache metryki** — sekcja Cache pokazuje `used`, `limit`, `percent` — wartości odpowiadają stanowi `OffscreenCache`.
7. **Refaktor OffscreenCache** — `OffscreenCache.ts` jest fasadą delegującą do `EntityCacheBudget` i `EntityLruIndex`. Tło, paralaksa, WorldLayer działają bez zmian.
8. **WorldLayer metryki** — `renderableCount`, `lastVisibleCount`, `lastCulledCount` zwracają poprawne wartości.
9. **Brak błędów** — zero błędów w konsoli. `npm run type-check` przechodzi bez errorów. `npm run build` buduje bez błędów.
10. **Prod bez artefaktów dev** — po buildzie produkcyjnym brak panelu, brak listenera toggle i brak stylu dev overlay.

### Artefakty zamykające Etap 3.5

| Artefakt | Stan |
|---|---|
| `dev/DevOverlayPanel.ts` — klasa panelu | Gotowy |
| `dev/DevSection.ts` — klasa sekcji | Gotowy |
| `dev/types.ts` — typy | Gotowy |
| `dev/index.ts` — re-eksport | Gotowy |
| `src/dev/styles/dev-overlay.css` — style panelu | Gotowy |
| `presentation/cache/cacheTypes.ts` — typy cache | Gotowy |
| `presentation/cache/EntityCacheBudget.ts` — budżet | Gotowy |
| `presentation/cache/EntityLruIndex.ts` — LRU | Gotowy |
| `presentation/cache/OffscreenCache.ts` — fasada (refaktor) | Gotowy, API bez zmian |
| `presentation/scene/WorldLayer.ts` — gettery metryk | Gotowy |
| `app/AppShell.ts` — integracja panelu + migracja test entity | Gotowy |
| `main.ts` — dynamiczny import CSS tylko w dev | Gotowy |
| `tsconfig.json` — alias `@dev` | Dodany |
| `vite.config.ts` — alias `@dev` | Dodany |
| `npm run type-check` | 0 errors |
| `npm run build` | Buduje bez błędów |

### Czego NIE ma w Etapie 3.5

- Grafów FPS, histogramów, timeline.
- Pełnego systemu konfiguracji runtime (engine settings).
- Testów jednostkowych panelu.
- Profilowania pamięci poza cache bytów.
- Panelu konfiguracji parametrów gry (np. prędkość kamery).

---

## 15. Otwarte decyzje do podjęcia

| # | Decyzja | Propozycja | Status | Pytanie/odpowiedź | Decyzja |
|---|---|---|---|---|---|
| D1 | Gdzie umieścić folder `dev/`? | `src/dev/` — oddzielona infrastruktura devowa, niezależna od warstw `engine/`, `entities/`, `presentation/`. Alias `@dev`. | Zatwierdzone | Tak niech bedzie w osobnym folderze src/dev/ wraz z aliasem `@dev` | Przyjąć |
| D2 | Czy panel powinien się odświeżać co klatkę, czy z throttle (np. 4 Hz)? | Throttle 4 Hz (co 250ms) — aktualizacja DOM co klatkę (60×/s) to waste. Gettery i tak wołane co klatkę, ale DOM update co 250ms. | Zatwierdzone | mysle ze to dobry pomysl te 4Hz | Przyjąć |
| D3 | Czy kategorie entity z count=0 ukrywać w panelu? | Nie — pokazywać wszystkie z wartością 0 (przejrzystość, gotowość na spawn). | Zatwierdzone | mysle ze niech beda widoczne, wole je widziec z wartoscia 0 jesli ich niema niz poprostu nie widziec tego elementu. | Przyjąć |
| D4 | Czy `entityBudget` w `OffscreenCache` ma być `public readonly` (bezpośredni dostęp) czy gettery w fasadzie? | Gettery w fasadzie (`entityCacheBytes`, `entityCacheLimit`, `entityCachePercent`) — czytelniejsze API, fasada ukrywa internale. | Zatwierdzone | Wybieram Gettery ze względu na stabilniejsze API | Przyjąć |
| D5 | Czy styl `dev-overlay.css` powinien być importowany warunkowo (tylko w dev mode)? | Tak — dynamiczny import tylko gdy `import.meta.env.DEV === true`, aby CSS nie trafiał do bundle prod. | Zatwierdzone | Wybieram czysty prod: style i panel tylko w dev mode. | Przyjąć |
| D6 | Czy persystencja collapse/expand sekcji w `localStorage`? | Nie w Etapie 3.5 — nadmierny scope. Łatwe do dodania później. | Zatwierdzone | Zanotować jako kandydat do kolejnego etapu (backlog). | Przyjąć z odłożeniem |

### Dodatkowa zasada organizacyjna

Style odpowiedzialne za dany element powinny znajdować się obok tego elementu (w tym samym folderze lub jego podfolderze `styles/`), aby uprościć nawigację i utrzymanie kodu.

---

## Struktura plików Etapu 3.5

```
src/
├── dev/
│   ├── styles/
│   │   └── dev-overlay.css      ← NOWY: style panelu (kolokacja z modułem dev)
│   ├── DevOverlayPanel.ts       ← klasa panelu
│   ├── DevSection.ts            ← klasa sekcji
│   ├── types.ts                 ← DevMetric, DevControl
│   └── index.ts                 ← re-eksport
├── presentation/
│   ├── cache/
│   │   ├── OffscreenCache.ts    ← ZMIANA: refaktor na fasadę
│   │   ├── EntityCacheBudget.ts ← NOWY: budżet pamięci
│   │   ├── EntityLruIndex.ts    ← NOWY: indeks LRU
│   │   ├── cacheTypes.ts        ← NOWY: typy i helpery
│   │   └── README.md            ← aktualizacja
│   └── scene/
│       └── WorldLayer.ts        ← ZMIANA: gettery metryk render
└── app/
    └── AppShell.ts              ← ZMIANA: integracja panelu, migracja test entity
```

---

## Podsumowanie zmian do istniejących dokumentów

| Dokument | Zmiana |
|---|---|
| `05_plan-prac.md` | Dodać Etap 3.5 z krótkim opisem i linkiem do `09_etap3.5-specyfikacja.md`. |
| `08_etap3-specyfikacja.md` | Bez zmian (D2 i D4 odwołują się do Etapu 3.5 — linki już ustawione). |
