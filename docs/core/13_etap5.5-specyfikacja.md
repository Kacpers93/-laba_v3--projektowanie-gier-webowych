# Etap 5.5 — Specyfikacja: Flight Model, sterowanie statkiem gracza i dev mode toggle

## Audyt stanu obecnego

### Zweryfikowane źródła

| Źródło | Status | Uwagi |
|---|---|---|
| `05_plan-prac.md` | ✅ Odczytane | Etap 5.5 zdefiniowany w liniach 70–77, status: „wdrożony" |
| `11_etap5-specyfikacja.md` | ✅ Odczytane | Etap 5 wdrożony, testy ręczne przeszły (adnotacje w sekcji 13) |
| `12_etap5-podstawa-specyfikacji.md` | ✅ Odczytane | Szkic wstępny, sformalizowany przez 11_etap5 |
| `00_input-and-keybindings.md` | ✅ Odczytane | Pełna architektura input: akcje, tryby, moduły |
| `00_extra_00_input-and-keybindings.md` | ✅ Odczytane | Szczegóły implementacyjne ControlsScreen, styl UI |
| `01_flight-model.md` | ✅ Odczytane | Fizyka Newtonowska, thrustery, obrót, Flight Assist, soft drag |
| `02_ship-slots-and-mass.md` | ✅ Odczytane | System masy — kontekst, poza zakresem 5.5 |
| `03_reactor-system.md` | ✅ Odczytane | System reaktora — kontekst, poza zakresem 5.5 |
| `04_ship-capture.md` | ✅ Odczytane | Przejęcie statku — kontekst, poza zakresem 5.5 |
| `05_etap7-world-architecture.md` | ✅ Odczytane | Wielosystemowość, sektory — kontekst późniejszy |
| `AppShell.ts` | ✅ Odczytane | Orkiestracja runtime, integracja flight mode/free camera, dev toggles, metryki `fps` i `frame ms` |
| `GameInput.ts` | ✅ Odczytane | Surowy `event.key`, akcja `toggle-flight-assist`, śledzenie `mouseWorldPos` |
| `InputModeManager.ts` | ✅ Odczytane (31 linii) | Tryby: `game`, `ui`, `locked` |
| `UIInput.ts` | ✅ Odczytane (66 linii) | Nawigacja UI strzałkami, Enter, Escape |
| `SystemSeedLoader.ts` | ✅ Odczytane (387 linii) | Loader seeda, pipeline instancjonowania |
| `WorldEntity.ts` | ✅ Odczytane (41 linii) | Klasa encji świata — brak `update()`, brak fizyki |
| `Renderer.ts` | ✅ Odczytane | Adaptacyjny `renderScale` z progami wejścia/wyjścia (histereza), osobne rozmiary logiczne i pikselowe |
| `Camera.ts` | ✅ Odczytane | `setRenderScale()` i transformacja uwzględniająca skalę renderu |
| `WorldLayer.ts` | ✅ Odczytane | `renderOrderDirty`, sortowanie tylko przy zmianie porządku |
| `EntityRenderable.ts` | ✅ Odczytane | `pixelSnapStatic` dla obiektów statycznych |
| `ParallaxLayer.ts` | ✅ Odczytane | Cap tekstur 1600x900, `densityMultiplier`, generacja cząstek `dust` |
| `seedTypes.ts` | ✅ Odczytane (151 linii) | Typy seeda, `RuntimeSeedObjectType` |
| `sol-001.json` | ✅ Odczytane (139 linii) | Seed startowy, `player-ship-01` istnieje |

### Wykryte sprzeczności i decyzje architektoniczne

| # | Sprzeczność | Decyzja |
|---|---|---|
| S1 | `00_input-and-keybindings.md` definiuje pełną architekturę input z `InputAction.ts`, `KeyBindings.ts`, `InputBindingsStore.ts`, `KeyboardMatcher.ts` — **żaden z tych plików nie istnieje w kodzie**. Obecny `GameInput.ts` operuje na surowych `event.key` i literalnych stringach (`' '`, `'shift'`, `'escape'`). | **Etap 5.5 NIE wdraża pełnej architektury input z dokumentacji.** Wdraża wersję minimalną: zestaw stałych akcji w nowym `FlightActions.ts` z domyślnymi klawiszami, odczytywanymi bezpośrednio przez `GameInput`. Pełna architektura (`InputBindingsStore`, `KeyboardMatcher`, `ControlsScreen`) jest wymogiem Etapu 6+. |
| S2 | `01_flight-model.md` definiuje 4 thrustery (`rear`, `front`, `strafe_left`, `strafe_right`), ale `05_plan-prac.md` (zakres 5.5) wymienia tylko „wstępny model przemieszczania gracza do testowania". | **Etap 5.5 wdraża rear i front thruster + obrót. Strafe NIE jest wymogiem zamknięcia.** Strafe traktowany jako rozszerzenie Etapu 7 lub dalszej iteracji 5.5. |
| S3 | `01_flight-model.md` odwołuje się do `drive.thrust`, `nominalMass`, `totalMass` z systemu slotów i masy (`02_ship-slots-and-mass.md`). System slotów i masy nie istnieje w kodzie. | **Etap 5.5 używa stałych hardkodowanych wartości parametrów lotu statku gracza** (thrust, maxSpeed, rotationSpeed, mass). Pełna integracja z systemem masy i slotów to Etap 7. |
| S4 | `01_flight-model.md` definiuje `effectiveMaxSpeed = baseMaxSpeed × sqrt(nominalMass / totalMass)`. Bez systemu masy ta formuła nie ma sensu. | **Etap 5.5 definiuje stały `maxSpeed` bez modyfikatora masowego.** Formuła masowa aktywowana w Etapie 7 po wdrożeniu `shipMassSystem`. |
| S5 | `01_flight-model.md` definiuje zużycie mocy reaktora: `thruster.powerMW × dt`. System reaktora nie istnieje. | **Etap 5.5 nie drainuje reaktora.** Thrustery działają bez ograniczenia energetycznego. Drain reaktora to Etap 7. |

---

## 1. Cel

Dostarczyć działający model lotu statku gracza oparty na fizyce Newtonowskiej z integracją z istniejącą pętlą gry i renderem. Po zamknięciu Etapu 5.5 gracz steruje statkiem na canvasie klawiszami WASD + Ctrl, kamera podąża za statkiem, a przełącznik dev mode pozwala wrócić do swobodnego przesuwania kamery strzałkami.

---

## 2. Parametry wejściowe

| Parametr | Wartość | Źródło |
|---|---|---|
| Załadowany system z Etapu 5 | `SystemSeedLoader.loadSystem()` wynik | Etap 5 |
| Encja `player-ship-01` | `WorldEntity` w `EntityManager` | Seed `sol-001.json`, Etap 5 |
| `GameInput` | Odczyt klawiszy w trybie `game` | Etap 1 |
| `InputModeManager` | Tryby `game`, `ui`, `locked` | Etap 1 |
| `Camera` | `position`, `follow()`, `zoom` | Etap 1 |
| `GameLoop` | `onFixedUpdate(dt)`, `onFrameUpdate(dt, alpha)` | Etap 1 |
| `DevOverlayPanel` | `registerSection`, `registerMetric`, `registerControl` | Etap 3.5 |

---

## 3. Parametry wyjściowe

| Parametr | Wartość |
|---|---|
| Statek gracza sterowany klawiaturą | WASD + Ctrl — obrót, thrust rear/front, toggle Flight Assist |
| Publiczne gettery lotu | `velocity: Vector2`, `acceleration: Vector2`, `heading: number` (rad) |
| Kamera śledząca gracza | `camera.follow(playerShip.position)` w trybie flight |
| Dev mode toggle | Przełącznik w Dev Overlay: flight mode ↔ free camera mode |
| Sekcja „Flight" w Dev Overlay | Metryki: speed, heading, FA status, position, velocity |

---

## 4. Zachowanie brzegowe

| Sytuacja | Zachowanie |
|---|---|
| Brak encji `player-ship` w seedzie | Tryb flight wyłączony. Gra startuje w free camera mode. `console.warn` z komunikatem. |
| `dt = 0` | Brak zmian w pozycji i prędkości. |
| Prędkość < 0.5 px/s przy FA ON | Flight Assist nie działa (próg deadzone). |
| Prędkość > `maxSpeed × 1.1` | Soft drag redukuje prędkość zgodnie z `01_flight-model.md`. |
| Przełączenie na tryb `ui` lub `locked` | Model lotu NIE jest aktualizowany. Statek zachowuje aktualną prędkość i pozycję. |
| `toggle-flight-assist` | Przełącza FA ON/OFF. Stan persystuje w pamięci runtime (nie w localStorage). |
| Dev mode toggle → free camera | Kamera przestaje śledzić gracza. Strzałki przesuwają kamerę. Model lotu nadal aktualizowany. |
| Dev mode toggle → flight mode | Kamera wraca do śledzenia gracza. Strzałki nie przesuwają kamery. |
| Dwa przeciwne thrustery naraz (W+S) | Oba działają jednocześnie — siły się kompensują. |

---

## 5. Stan obecny i zależności

### Co istnieje

| Element | Lokalizacja | Status |
|---|---|---|
| `WorldEntity` | `world/entities/WorldEntity.ts` | ✅ Gotowy — ale **brak `update()`**. Klasa nie ma fizyki. |
| `BaseEntity` | `entities/base/BaseEntity.ts` | ✅ Gotowy — `savePreviousState()`, `position`, `velocity`, `rotation` |
| `GameEntity` | `entities/base/GameEntity.ts` | ✅ Gotowy — interfejs z `velocity: Vector2` |
| `GameInput` | `engine/input/GameInput.ts` | ✅ Gotowy — `isKeyDown(key)`, buffer akcji, tryb game |
| `InputModeManager` | `engine/input/InputModeManager.ts` | ✅ Gotowy — `setMode()`, `mode`, `onModeChanged()` |
| `Camera` | `engine/renderer/Camera.ts` | ✅ Gotowy — `follow()`, `position`, `zoom` |
| `AppShell` | `app/AppShell.ts` | ✅ Gotowy — `onFixedUpdate` z kamerą na strzałki, pętla entity update |
| `DevOverlayPanel` | `dev/DevOverlayPanel.ts` | ✅ Gotowy — sekcje, metryki, kontrolki |
| Seed `sol-001.json` | `public/world/systems/sol-001.json` | ✅ Gotowy — `player-ship-01` z `static: false` |

### Czego brakuje

1. **Brak klasy `PlayerShipEntity`** — `WorldEntity` nie ma `update()` ani parametrów lotu.
2. **Brak modelu lotu** — nie istnieje `flightModel.ts` ani żadna fizyka Newtonowska.
3. **Brak Flight Assist** — nie istnieje żaden system automatycznego hamowania.
4. **Brak soft drag** — brak ograniczenia prędkości maksymalnej.
5. **Brak mapowania akcji lotu na klawisze** — `GameInput` używa surowych klawiszy.
6. **Brak śledzenia kamery za graczem** — kamera poruszana strzałkami.
7. **Brak dev mode toggle** — nie ma przełącznika flight/free camera.
8. **Brak getterów statystyk lotu** — `WorldEntity` nie eksponuje velocity, acceleration, heading.
9. **Brak sekcji Flight w Dev Overlay**.

---

## 6. Zakres Etapu 5.5

### Wchodzi w Etap 5.5

1. Klasa `PlayerShipEntity` rozszerzająca `WorldEntity` o `update(dt)` z fizyką lotu.
2. Moduł `flightModel.ts` — czysta fizyka: integracja Newtonowska, obrót, Flight Assist, soft drag.
3. Moduł `flightConfig.ts` — stałe hardkodowane parametry lotu (v0).
4. Minimalne `FlightActions.ts` — stałe akcji lotu i domyślne mapowanie klawiszy (v0).
5. Rozszerzenie `GameInput` o odczyt akcji lotu przez stałe z `FlightActions`.
6. Kamera śledząca gracza w trybie flight.
7. Dev mode toggle (checkbox w Dev Overlay): flight ↔ free camera.
8. Publiczne gettery: `velocity`, `acceleration`, `heading` w `PlayerShipEntity`.
9. Sekcja „Flight" w Dev Overlay z metrykami lotu.
10. Integracja z `AppShell.start()` — wykrywanie `player-ship` w seedzie, tworzenie `PlayerShipEntity`.

### NIE wchodzi w Etap 5.5

- System slotów i masy (`shipMassSystem`) — Etap 7.
- System reaktora i drain mocy — Etap 7.
- Strafe thrustery (lewo/prawo) — Etap 7 lub dalszy.
- Sterowanie myszą (target heading) — Etap 7 lub dalszy.
- Pełna architektura input (`InputBindingsStore`, `KeyboardMatcher`, `ControlsScreen`) — Etap 6+.
- System broni (`fire-weapon`, `fire-missile`) — Etap 7.
- Kolizje ze stacjami, asteroidami, granicami mapy — Etap 7+.
- Wielosystemowość, sektory, wrota — Etap 8.
- HUD, ekrany UI — Etap 6.
- Ekran rebindowania klawiszy (`ControlsScreen`) — wyłączony z minimum Etapu 5.5, jako kolejny krok.
- Gamepad/joystick — poza zakresem.

---

## 7. Poza zakresem Etapu 5.5 — szczegółowe wykluczenia

| Element | Etap docelowy | Uzasadnienie |
|---|---|---|
| `InputBindingsStore` + `KeyboardMatcher` | 6+ | Wymaga ekranu UI do rebindowania, który nie istnieje |
| `ControlsScreen` | 6+ | Zależy od `ScreenManager`, który nie istnieje |
| Strafe thrustery | 7 | Wymaga pełnego modelu masy do balansowania |
| Zużycie mocy reaktora | 7 | Wymaga `reactorSystem` |
| Formuła `effectiveMaxSpeed` z masą | 7 | Wymaga `shipMassSystem` |
| `ShipDef` z pełną definicją slotów | 7 | Zależy od systemu slotów |
| Tryb myszy (target heading) | 7+ | Wymaga integracji z celowaniem, HUD crosshair |
| Animacje sprite thrust | 9/10 | Warianty wizualne i efekty |

---

## 8. Kontrakty techniczne

### 8.1. Model danych statku gracza dla lotu

```typescript
// systems/flight/flightConfig.ts

/** Hardkodowane parametry lotu dla Etapu 5.5. */
export interface FlightConfig {
  /** Siła rear thrustera [px/s²]. */
  readonly rearThrust: number;

  /** Siła front thrustera (hamowanie) [px/s²]. Względna do rear: 0.3. */
  readonly frontThrust: number;

  /** Prędkość obrotu [rad/s]. */
  readonly rotationSpeed: number;

  /** Maksymalna prędkość przed soft drag [px/s]. */
  readonly maxSpeed: number;

  /** Współczynnik soft drag powyżej maxSpeed × 1.1. */
  readonly softDragCoefficient: number;

  /** Próg deadzone dla Flight Assist [px/s]. */
  readonly flightAssistDeadzone: number;
}

/** Domyślna konfiguracja v0. */
export const DEFAULT_FLIGHT_CONFIG: FlightConfig = {
  rearThrust: 120,
  frontThrust: 36,       // 120 × 0.3
  rotationSpeed: 3.0,    // ~172 deg/s
  maxSpeed: 300,
  softDragCoefficient: 0.15,
  flightAssistDeadzone: 0.5,
};
```

### 8.2. `PlayerShipEntity`

```typescript
// world/entities/PlayerShipEntity.ts

import { WorldEntity } from './WorldEntity';
import type { FlightConfig } from '@systems/flight/flightConfig';
import type { Vector2 } from '@/types/common';
import type { RuntimeSeedObjectType } from '../seed/seedTypes';
import type { EntityCategory } from '@entities/base/EntityCategory';

export class PlayerShipEntity extends WorldEntity {
  /** Bieżące przyspieszenie ramki (po update). */
  private currentAcceleration: Vector2 = { x: 0, y: 0 };

  /** Stan Flight Assist. */
  private flightAssistEnabled = true;

  /** Konfiguracja lotu. */
  public readonly flightConfig: FlightConfig;

  public constructor(config: {
    id: string;
    category: EntityCategory;
    seedType: RuntimeSeedObjectType;
    position: Vector2;
    width: number;
    height: number;
    computedHeight: number;
    isStatic: boolean;
    profileId: string;
    flightConfig: FlightConfig;
  }) {
    super(config);
    this.flightConfig = config.flightConfig;
  }

  // --- Publiczne gettery statystyk lotu ---

  /** Bieżąca prędkość [px/s]. */
  public get speed(): number {
    return Math.hypot(this.velocity.x, this.velocity.y);
  }

  /** Wektor prędkości [px/s]. */
  public get currentVelocity(): Vector2 {
    return { x: this.velocity.x, y: this.velocity.y };
  }

  /** Wektor przyspieszenia z ostatniego update [px/s²]. */
  public get acceleration(): Vector2 {
    return { x: this.currentAcceleration.x, y: this.currentAcceleration.y };
  }

  /** Kąt dzioba statku [rad]. 0 = prawo, PI/2 = dół. */
  public get heading(): number {
    return this.rotation;
  }

  /** Czy Flight Assist jest włączony. */
  public get isFlightAssistEnabled(): boolean {
    return this.flightAssistEnabled;
  }

  /** Przełącza Flight Assist ON/OFF. */
  public toggleFlightAssist(): void {
    this.flightAssistEnabled = !this.flightAssistEnabled;
  }

  /**
   * Aktualizacja fizyki lotu.
   * @param dt - Delta czasu z pętli fizyki [s].
   * @param input - Stan wejścia lotu.
   */
  public updateFlight(dt: number, input: FlightInput): void {
    // Delegacja do flightModel
    // Szczegóły w sekcji 8.4
  }
}

export interface FlightInput {
  rotateLeft: boolean;
  rotateRight: boolean;
  rearThruster: boolean;
  frontThruster: boolean;
}
```

### 8.3. Kontrakt input action i mapowanie klawiszy v0

```typescript
// systems/flight/FlightActions.ts

/**
 * Minimalne akcje lotu dla Etapu 5.5.
 * Wersja v0 — bez systemu rebindowania.
 * Domyślne mapowanie na event.key (lowercase).
 */
export const FLIGHT_KEY_MAP = {
  'rotate-left': 'a',
  'rotate-right': 'd',
  'rear-thruster': 'w',
  'front-thruster': 's',
  'toggle-flight-assist': 'control',
} as const;

export type FlightActionId = keyof typeof FLIGHT_KEY_MAP;
```

**Uzasadnienie mapowania na `event.key`:** Obecny `GameInput.ts` operuje na `event.key.toLowerCase()` i `keyState: Set<string>`. Pełna architektura z `event.code` i `KeyboardMatcher` jest zaplanowana na Etap 6+. W Etapie 5.5 mapowanie jest warstwą stałych nad istniejącym mechanizmem.

**Akcje działające tylko w trybie `game`:**

| Akcja | Tryb | Uwagi |
|---|---|---|
| `rotate-left` | `game` | Aktywna wyłącznie w trybie game. |
| `rotate-right` | `game` | Aktywna wyłącznie w trybie game. |
| `rear-thruster` | `game` | Aktywna wyłącznie w trybie game. |
| `front-thruster` | `game` | Aktywna wyłącznie w trybie game. |
| `toggle-flight-assist` | `game` | Aktywna wyłącznie w trybie game. Akcja jednorazowa (toggle na keydown, nie trzymanie). |

### 8.4. Kontrakt przełączania trybów wejścia

Reguły priorytetu wejścia:

| Tryb | `GameInput` | `UIInput` | Model lotu | Kamera | Strzałki |
|---|---|---|---|---|---|
| `game` + flight mode | ✅ aktywny | ❌ | ✅ aktualizowany | `follow(player)` | ❌ ignorowane |
| `game` + free camera (dev) | ✅ aktywny | ❌ | ✅ aktualizowany | swobodna | ✅ przesuwają kamerę |
| `ui` | ❌ | ✅ aktywny | ❌ zatrzymany | bez zmian | ❌ |
| `locked` | ❌ | ❌ | ❌ zatrzymany | bez zmian | ❌ |

Przejścia:

```
start gry (Etap 5.5)         -> game + flight mode (jeśli player-ship istnieje)
start gry (brak player-ship)  -> game + free camera mode
Escape                        -> ui
Escape (w ui)                 -> game (powrót do aktywnego trybu kamery)
Dev toggle: flight → free     -> game + free camera
Dev toggle: free → flight     -> game + flight mode
```

`toggle-flight-assist` — przechwytywany w `handleKeyDown`, dodawany do `bufferedActions`, przetwarzany w `update()`. NIE jest trzymanym klawiszem (`isKeyDown`), lecz jednorazową akcją.

---

## 9. Pipeline runtime

### 9.1. Odczyt inputu

W `onFixedUpdate(dt)`:

```
1. gameInput.update()                          // istniejące
2. if (modeManager.mode !== 'game') return     // istniejące
3. Odczytaj stan klawiszy:
   - rotateLeft  = gameInput.isKeyDown(FLIGHT_KEY_MAP['rotate-left'])
   - rotateRight = gameInput.isKeyDown(FLIGHT_KEY_MAP['rotate-right'])
   - rearThruster = gameInput.isKeyDown(FLIGHT_KEY_MAP['rear-thruster'])
   - frontThruster = gameInput.isKeyDown(FLIGHT_KEY_MAP['front-thruster'])
4. Przekaż FlightInput do playerShip.updateFlight(dt, input)
```

### 9.2. Update flight model

W `PlayerShipEntity.updateFlight(dt, input)` delegacja do czystych funkcji z `flightModel.ts`:

```typescript
// physics/movement/flightModel.ts

import type { Vector2 } from '@/types/common';
import type { FlightConfig } from '@systems/flight/flightConfig';
import type { FlightInput } from '@world/entities/PlayerShipEntity';

export interface FlightUpdateResult {
  newVelocity: Vector2;
  newRotation: number;
  acceleration: Vector2;
}

/**
 * Czysta funkcja update fizyki lotu.
 * Nie mutuje żadnych obiektów — zwraca nowy stan.
 */
export function computeFlightUpdate(
  currentVelocity: Vector2,
  currentRotation: number,
  input: FlightInput,
  config: FlightConfig,
  flightAssistEnabled: boolean,
  dt: number,
): FlightUpdateResult {
  // 1. Obrót
  let newRotation = currentRotation;
  if (input.rotateLeft) {
    newRotation -= config.rotationSpeed * dt;
  }
  if (input.rotateRight) {
    newRotation += config.rotationSpeed * dt;
  }

  // 2. Oblicz przyspieszenie z thrusterów
  const headingX = Math.cos(newRotation);
  const headingY = Math.sin(newRotation);

  let ax = 0;
  let ay = 0;

  if (input.rearThruster) {
    ax += headingX * config.rearThrust;
    ay += headingY * config.rearThrust;
  }

  if (input.frontThruster) {
    ax -= headingX * config.frontThrust;
    ay -= headingY * config.frontThrust;
  }

  // 3. Flight Assist
  if (flightAssistEnabled) {
    const faAccel = computeFlightAssist(
      currentVelocity, newRotation, config, dt,
    );
    ax += faAccel.x;
    ay += faAccel.y;
  }

  // 4. Integracja Eulera
  let newVx = currentVelocity.x + ax * dt;
  let newVy = currentVelocity.y + ay * dt;

  // 5. Soft drag
  const speed = Math.hypot(newVx, newVy);
  const softLimit = config.maxSpeed * 1.1;
  if (speed > softLimit) {
    const drag = config.softDragCoefficient * (speed - softLimit);
    newVx -= (newVx / speed) * drag * dt;
    newVy -= (newVy / speed) * drag * dt;
  }

  return {
    newVelocity: { x: newVx, y: newVy },
    newRotation,
    acceleration: { x: ax, y: ay },
  };
}

/**
 * Oblicza przyspieszenie Flight Assist.
 * FA hamuje prędkość boczną i wsteczną, nie hamuje ruchu do przodu.
 */
function computeFlightAssist(
  velocity: Vector2,
  rotation: number,
  config: FlightConfig,
  _dt: number,
): Vector2 {
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed < config.flightAssistDeadzone) {
    return { x: 0, y: 0 };
  }

  const headingX = Math.cos(rotation);
  const headingY = Math.sin(rotation);

  // Składowa do przodu (rzut velocity na heading)
  const forwardComponent = velocity.x * headingX + velocity.y * headingY;

  // Składowa boczna (rzut velocity na heading + 90°)
  const lateralX = -headingY;
  const lateralY = headingX;
  const lateralComponent = velocity.x * lateralX + velocity.y * lateralY;

  let ax = 0;
  let ay = 0;

  // Hamuj ruch wsteczny (front thruster)
  if (forwardComponent < -1) {
    ax += headingX * config.frontThrust;
    ay += headingY * config.frontThrust;
  }

  // Hamuj boczny drift
  if (lateralComponent > 1) {
    // Drift w prawo — hamuj siłą w lewo
    ax -= lateralX * config.frontThrust;
    ay -= lateralY * config.frontThrust;
  }
  if (lateralComponent < -1) {
    // Drift w lewo — hamuj siłą w prawo
    ax += lateralX * config.frontThrust;
    ay += lateralY * config.frontThrust;
  }

  return { x: ax, y: ay };
}
```

### 9.3. Synchronizacja encji i renderu

W `onFixedUpdate(dt)` — po `updateFlight()`:

```
1. playerShip.position = {
     x: playerShip.position.x + playerShip.velocity.x * dt,
     y: playerShip.position.y + playerShip.velocity.y * dt,
   }
```

**Uwaga:** Integracja pozycji odbywa się wewnątrz `updateFlight()` w `PlayerShipEntity` — statek sam aktualizuje swoją `position` po obliczeniu nowej prędkości.

W `onFrameUpdate(dt, alpha)` — istniejący kod w `AppShell` kopiuje `position`, `previousPosition`, `rotation` z encji do renderable. Ten mechanizm nie wymaga zmian.

Kamera:

```
// W onFixedUpdate, po update encji:
if (devFlightMode && playerShipEntity) {
  camera.follow(playerShipEntity.position);
}
// else: istniejąca logika strzałek
```

---

## 10. Walidacja i obsługa błędów

| # | Warunek | Poziom | Akcja |
|---|---|---|---|
| E1 | Brak encji o `seedType === 'player-ship'` po załadowaniu seeda | warn | Gra startuje w free camera mode. Dev Overlay: Flight sekcja pokazuje status: „no player-ship". |
| E2 | `dt <= 0` w `updateFlight()` | guard | Early return, brak zmian. |
| E3 | `NaN` w velocity po obliczeniu | error | Reset velocity do `{x: 0, y: 0}`. `console.error('[FlightModel] NaN detected, velocity reset.')`. |
| E4 | `FlightConfig` z ujemnymi wartościami | guard | `Math.abs()` na `rearThrust`, `frontThrust`, `rotationSpeed`, `maxSpeed` przy inicjalizacji. |
| E5 | `PlayerShipEntity` usunięty z `EntityManager` w runtime | guard | Null-check w `onFixedUpdate`. Tryb flight wyłączony automatycznie. |

---

## 11. Integracja z Dev Overlay i metryki lotu

### 11.1. Sekcja „Flight"

| Metryka | Getter | Format |
|---|---|---|
| `speed` | `playerShip.speed` | `N.1 px/s` |
| `heading` | `playerShip.heading` | `N.1°` (konwersja rad → deg) |
| `velocity` | `playerShip.currentVelocity` | `(N.1, N.1)` |
| `acceleration` | `playerShip.acceleration` | `(N.1, N.1)` |
| `flight-assist` | `playerShip.isFlightAssistEnabled` | `ON` / `OFF` |
| `position` | `playerShip.position` | `(N.1, N.1)` |

### 11.2. Dev mode toggle

| Kontrola | Typ | Opis |
|---|---|---|
| `flight-mode` | checkbox | Domyślnie: `true` (jeśli player-ship istnieje). Wyłączenie → kamera swobodna strzałkami. Włączenie → kamera śledzi gracza. |

Umieszczenie: istniejąca sekcja „Dev Flags" w Dev Overlay.

---

## 12. Kryteria zamknięcia Etapu 5.5

| # | Kryterium | Opis | Kryterium spełnione? |
|---|---|---|---|
| K1 | Statek gracza porusza się | Po wciśnięciu W statek gracza przyspiesza w kierunku dzioba. | Tak |
| K2 | Statek gracza hamuje | Po wciśnięciu S statek hamuje thrusterem front (siła 0.3× rear). | Tak |
| K3 | Obrót działa | A i D obracają statek z prędkością `rotationSpeed`. | Tak |
| K4 | Fizyka Newtonowska | Po puszczeniu W statek leci z aktualną prędkością bez spowolnienia (FA OFF). | Tak |
| K5 | Flight Assist ON | Przy FA ON statek automatycznie hamuje drift boczny i ruch wsteczny. | Tak |
| K6 | Flight Assist toggle | Ctrl przełącza FA ON/OFF. Stan widoczny w Dev Overlay: „ON"/„OFF". | Tak |
| K7 | Soft drag | Powyżej `maxSpeed × 1.1` prędkość jest hamowana soft dragiem. | Tak |
| K8 | Kamera śledzi gracza | W trybie flight kamera podąża za pozycją statku gracza. | Tak |
| K9 | Dev mode: free camera | Po wyłączeniu checkboxa „flight-mode" kamera wraca do sterowania strzałkami. | Tak |
| K10 | Dev mode: powrót do flight | Po ponownym włączeniu checkboxa kamera wraca do śledzenia gracza. | Tak |
| K11 | Gettery lotu | `velocity`, `acceleration`, `heading` — dostępne jako publiczne gettery na `PlayerShipEntity`. | Tak |
| K12 | Dev Overlay: sekcja Flight | Sekcja pokazuje speed, heading, velocity, acceleration, FA status, position. | Tak |
| K13 | Brak regresji Etapu 5 | Seed loader, world rendering, dev overlay (sekcje System, Entities, Render, Cache, Assets) — działają bez zmian. | Tak |
| K14 | Brak regresji wcześniejszych etapów | Tło, paralaksa, debug grid, culling, interpolacja, cache — działają bez zmian. | Tak |
| K15 | Kompilacja | `npm run type-check` → 0 errors. `npm run build` → buduje bez błędów. | Tak |
| K16 | Brak player-ship fallback | Gdy brak encji player-ship w seedzie, gra startuje w free camera mode bez crashu. | Tak |

### Artefakty zamykające Etap 5.5

| Artefakt | Stan |
|---|---|
| `physics/movement/flightModel.ts` — czysta fizyka lotu | NOWY |
| `systems/flight/flightConfig.ts` — parametry v0 | NOWY |
| `systems/flight/FlightActions.ts` — mapowanie klawiszy v0 | NOWY |
| `world/entities/PlayerShipEntity.ts` — klasa statku gracza | NOWY |
| `world/entities/index.ts` — re-eksport rozszerzony | ZMIANA |
| `app/AppShell.ts` — integracja lotu, kamera follow, dev toggle | ZMIANA |
| Ewentualne drobne zmiany w `GameInput.ts` — obsługa `toggle-flight-assist` jako buforowanej akcji | ZMIANA |
| `npm run type-check` | 0 errors |
| `npm run build` | Buduje bez błędów |

---

## 13. Plan testów

### Testy ręczne

| # | Test | Oczekiwany wynik |
|---|---|---|
| M1 | `npm run dev`, wciśnij W | Statek gracza przyspiesza w kierunku dzioba i oddala się od początkowej pozycji. |
| M2 | Wciśnij W, puść, czekaj (FA OFF) | Statek leci z aktualną prędkością bez spowolnienia (drift Newtonowski). |
| M3 | Wciśnij A/D podczas W | Statek obraca się płynnie. Kierunek thrustu zmienia się z obrotem. |
| M4 | Wciśnij S | Statek hamuje w osi heading (siła słabsza niż W). |
| M5 | Wciśnij Ctrl | FA przełącza się. Dev Overlay: Flight → flight-assist zmienia się ON/OFF. |
| M6 | FA ON, wciśnij W, puść, czekaj | Po puszczeniu W statek automatycznie hamuje drift boczny. |
| M7 | Wciśnij i trzymaj W do przekroczenia maxSpeed | Prędkość stabilizuje się wokół maxSpeed dzięki soft drag. |
| M8 | Obserwuj kamerę | Kamera śledzi statek gracza w trybie flight. |
| M9 | Dev Overlay → Dev Flags → odznacz flight-mode | Kamera przestaje śledzić. Strzałki przesuwają kamerę. |
| M10 | Dev Overlay → Dev Flags → zaznacz flight-mode | Kamera wraca do śledzenia gracza. |
| M11 | Dev Overlay → Flight → metryki | Speed, heading, velocity, acceleration aktualizują się w czasie rzeczywistym. |
| M12 | Usuń `player-ship-01` z seeda, przeładuj | Gra startuje w free camera mode. `console.warn` w konsoli. Sekcja Flight: „no player-ship". |
| M13 | `npm run type-check` | 0 errors. |
| M14 | `npm run build` | Buduje bez błędów. |
| M15 | Sprawdź regresję: Dev Overlay → System | Sekcja System (entities, asteroids, load time) działa bez zmian. |
| M16 | Sprawdź regresję: tło, paralaksa, culling | Brak zmian wizualnych, brak crashy. |

### Kandydaci do automatyzacji

| # | Test | Moduł |
|---|---|---|
| A1 | `computeFlightUpdate` z `rearThruster=true` daje przyspieszenie w kierunku heading | `flightModel.ts` |
| A2 | `computeFlightUpdate` z `frontThruster=true` daje przyspieszenie przeciwne do heading | `flightModel.ts` |
| A3 | `computeFlightUpdate` z `rotateLeft=true` zmniejsza rotation | `flightModel.ts` |
| A4 | `computeFlightUpdate` bez inputu zachowuje prędkość (FA OFF) | `flightModel.ts` |
| A5 | Flight Assist hamuje drift boczny | `flightModel.ts` |
| A6 | Soft drag redukuje prędkość powyżej `maxSpeed × 1.1` | `flightModel.ts` |
| A7 | `computeFlightUpdate` z `dt=0` zwraca bieżący stan bez zmian | `flightModel.ts` |

---

## 14. Kolejność implementacji krok po kroku

```
Krok 1: Konfiguracja lotu
         systems/flight/flightConfig.ts — FlightConfig + DEFAULT_FLIGHT_CONFIG
         ↓
Krok 2: Akcje lotu
         systems/flight/FlightActions.ts — FLIGHT_KEY_MAP + FlightActionId
         ↓
Krok 3: Model fizyki lotu
         physics/movement/flightModel.ts — computeFlightUpdate(), computeFlightAssist()
         ↓
Krok 4: Klasa statku gracza
         world/entities/PlayerShipEntity.ts
           — rozszerza WorldEntity
           — updateFlight(dt, input) deleguje do computeFlightUpdate
           — publiczne gettery: speed, currentVelocity, acceleration, heading, isFlightAssistEnabled
           — toggleFlightAssist()
         ↓
Krok 5: Re-eksport
         world/entities/index.ts — dodać eksport PlayerShipEntity
         ↓
Krok 6: Rozszerzenie GameInput
         engine/input/GameInput.ts — dodać 'toggle-flight-assist' do bufferedActions
           (keydown na FLIGHT_KEY_MAP['toggle-flight-assist'])
         ↓
Krok 7: Integracja z AppShell — wykrywanie player-ship
         app/AppShell.ts:
           — po loadSystem(): wyszukaj encję o seedType === 'player-ship'
           — jeśli istnieje: stwórz PlayerShipEntity zamiast WorldEntity
           — pole: private playerShipEntity: PlayerShipEntity | null
           — pole: private devFlightMode = true
         ↓
Krok 8: Integracja z AppShell — pętla lotu
         app/AppShell.ts → onFixedUpdate():
           — if (playerShipEntity && modeManager.mode === 'game')
             → odczytaj FLIGHT_KEY_MAP z gameInput.isKeyDown()
             → playerShipEntity.updateFlight(dt, input)
           — if (devFlightMode && playerShipEntity)
             → camera.follow(playerShipEntity.position)
           — else: istniejąca logika strzałek
         ↓
Krok 9: Toggle Flight Assist w AppShell
         app/AppShell.ts → bindInputActions():
           — gameInput.onAction('toggle-flight-assist', () => playerShipEntity?.toggleFlightAssist())
         ↓
Krok 10: Dev Overlay — sekcja Flight
          app/AppShell.ts → w bloku devOverlay inicjalizacji:
            — registerSection('flight', 'Flight')
            — metryki: speed, heading, velocity, acceleration, flight-assist, position
         ↓
Krok 11: Dev Overlay — dev mode toggle
          app/AppShell.ts → sekcja 'dev-flags':
            — registerControl('flight-mode', 'Flight mode', 'checkbox', devFlightMode, (v) => { devFlightMode = v; })
         ↓
Krok 12: Konfiguracja aliasów
          tsconfig.json i vite.config.ts: "@systems/*": ["./src/systems/*"]
          (jeśli alias nie istnieje)
         ↓
Krok 13: Modyfikacja SystemSeedLoader
          SystemSeedLoader.ts LUB AppShell.ts:
            — po załadowaniu obiektów, zastąp WorldEntity o seedType === 'player-ship'
              na PlayerShipEntity (z parametrami FlightConfig)
            Preferowana strategia: AppShell pobiera entity po loadSystem(),
            unregisteruje WorldEntity i rejestruje PlayerShipEntity w tym samym miejscu.
         ↓
Krok 14: Weryfikacja ręczna
          npm run dev — statek sterowany klawiaturą, kamera śledzi
          npm run type-check — 0 errors
          npm run build — buduje bez błędów
```

---

## Struktura plików Etapu 5.5

```
src/
├── systems/                             ← NOWY KATALOG
│   └── flight/
│       ├── flightConfig.ts             ← NOWY: parametry lotu v0
│       └── FlightActions.ts            ← NOWY: mapowanie klawiszy v0
├── physics/
│   └── movement/
│       └── flightModel.ts              ← NOWY: czysta fizyka lotu
├── world/
│   └── entities/
│       ├── WorldEntity.ts              ← BEZ ZMIAN
│       ├── PlayerShipEntity.ts         ← NOWY: klasa statku gracza
│       └── index.ts                    ← ZMIANA: re-eksport PlayerShipEntity
├── engine/
│   └── input/
│       └── GameInput.ts                ← ZMIANA: toggle-flight-assist w buforze
├── app/
│   └── AppShell.ts                     ← ZMIANA: integracja flight, kamera, devtoggle
```

---

## Podsumowanie zmian do istniejących dokumentów

| Dokument | Zmiana |
|---|---|
| `05_plan-prac.md` | Status Etapu 5.5 ustawiony na „wdrożony". Kryteria zamknięcia odwołane do `13_etap5.5-specyfikacja.md` (sekcja 12 + sekcje rozszerzeń). |
| `11_etap5-specyfikacja.md` | Bez zmian. |
| `01_flight-model.md` | Bez zmian — dokument jest definicją docelowego modelu. Etap 5.5 wdraża podzbiór (rear/front + obrót + FA + soft drag). |

---

## Checklista gotowości implementacyjnej

| # | Pytanie | Odpowiedź |
|---|---|---|
| 1 | Czy wszystkie pliki wejściowe zostały przeczytane? | ✅ Tak — dokumenty etapowe + kluczowe pliki runtime (`AppShell`, `GameInput`, `Renderer`, `Camera`, `WorldLayer`, `EntityRenderable`, `ParallaxLayer`, `PlayerShipEntity`, `flightModel`). |
| 2 | Czy sprzeczności zostały wykryte i rozstrzygnięte? | ✅ Tak — 5 sprzeczności (S1–S5) z jednoznacznymi decyzjami. |
| 3 | Czy zakres jest minimalny i zamknięty? | ✅ Tak — rear/front thruster, obrót, FA, soft drag, kamera follow, dev toggle. |
| 4 | Czy zakres nie miesza się z Etapem 7/8? | ✅ Tak — brak systemu masy, reaktora, slotów, kolizji, wielosystemowości. |
| 5 | Czy kontrakty są jednoznaczne? | ✅ Tak — typy TS, sygnatury funkcji, stałe. |
| 6 | Czy pipeline runtime jest opisany krok po kroku? | ✅ Tak — sekcja 9. |
| 7 | Czy kryteria zamknięcia są testowalne? | ✅ Tak — 16 kryteriów (K1–K16), 16 testów ręcznych (M1–M16). |
| 8 | Czy kolejność implementacji jest liniowa i zależnościowa? | ✅ Tak — 14 kroków, każdy zależy od poprzedniego. |
| 9 | Czy dokument nie psuje kompatybilności z dalszą rozbudową? | ✅ Tak — `FlightConfig` będzie zastąpiony przez `ShipDef + drive.thrust` w Etapie 7. `FLIGHT_KEY_MAP` przez `InputBindingsStore` w Etapie 6+. |
| 10 | Czy język jest jednoznaczny, wdrożeniowy, bez ogólników? | ✅ Tak. |

---

## 15. Rozszerzenie Etapu 5.5: Optymalizacja renderu (5.5.1)

### 15.1. Cel rozszerzenia

Podnieść stabilność FPS dla dużych rozmiarów okna (ok. 2119x1160) bez zmiany mechanik gameplayu z Etapu 5.5. Rozszerzenie dotyczy wyłącznie warstwy render/input-orderingu.

### 15.2. Zakres rozszerzenia (wchodzi)

1. Adaptacyjna skala renderu canvasa (internal render scale) zależna od powierzchni viewportu.
2. Utrzymanie poprawnego mapowania pozycji myszy do world-space przy aktywnej skali renderu.
3. Sortowanie renderables w `WorldLayer` tylko przy zmianie porządku (`dirty sort`) zamiast sortowania co klatkę.

### 15.3. Poza zakresem rozszerzenia

- Zmiana mechaniki lotu, FA, soft drag, seed loadera i systemów Etapu 5.
- Zmiana formatu assetów oraz profili wizualnych.
- Przebudowa cullingu do struktur przestrzennych (grid/quadtree).

### 15.4. Kontrakty techniczne

#### 15.4.1. Renderer: internal render scale

Plik: `src/engine/renderer/Renderer.ts`

Wymagania:

- Renderer przechowuje osobno:
  - rozmiar logiczny (`displayWidth`, `displayHeight`) = rozmiar CSS / viewport,
  - rozmiar pikselowy (`pixelWidth`, `pixelHeight`) = realny rozmiar bufora canvasa.
- `canvas.style.width/height` ustawiane na rozmiar logiczny.
- `canvas.width/height` ustawiane na rozmiar pikselowy.
- Skala renderu (`renderScale`) wyznaczana adaptacyjnie z histerezą:
  - gdy aktualnie `renderScale === 1` i `width * height >= 1_600_000` -> `renderScale = 0.65`,
  - gdy aktualnie `renderScale < 1` i `width * height <= 1_350_000` -> `renderScale = 1.0`,
  - w pozostałych przypadkach utrzymanie bieżącej skali.

Kontrakt API renderera po rozszerzeniu:

- `width`, `height` -> zwracają rozmiar logiczny.
- `pixelWidth`, `pixelHeight` -> zwracają rozmiar bufora.
- `scale` -> zwraca aktywną skalę renderu.

#### 15.4.2. Camera: skala transformacji

Plik: `src/engine/renderer/Camera.ts`

Wymagania:

- Kamera przechowuje `renderScale` (domyślnie `1`).
- `applyTransform()` mnoży skalę transformacji i translację przez `renderScale`, tak aby zachować logiczny viewport przy niższej rozdzielczości bufora.
- Dodane `setRenderScale(scale)` z ochroną przed wartościami <= 0.

#### 15.4.3. AppShell: integracja skali

Plik: `src/app/AppShell.ts`

Wymagania:

- Po inicjalizacji renderera: `camera.setRenderScale(renderer.scale)`.
- W `handleResize()`:
  - `camera.setViewport(renderer.width, renderer.height)`,
  - `camera.setRenderScale(renderer.scale)`.
- `BackgroundLayer` i `ParallaxLayer` regenerowane rozmiarem pikselowym (`renderer.pixelWidth`, `renderer.pixelHeight`).

#### 15.4.4. GameInput: mapowanie myszy po skali

Plik: `src/engine/input/GameInput.ts`

Wymagania:

- W `mousemove` pozycja myszy liczona w przestrzeni logicznej viewportu:

```typescript
mouseScreenPos = {
  x: event.clientX - rect.left,
  y: event.clientY - rect.top,
};
```

- Aktualizacja `mouseWorldPos` odbywa się przez `camera.screenToWorld(mouseScreenPos)` w `update()`.

#### 15.4.5. WorldLayer: dirty sort

Plik: `src/presentation/scene/WorldLayer.ts`

Wymagania:

- Dodać flagę `renderOrderDirty`.
- Sortowanie po `computedHeight` wykonywać wyłącznie gdy `renderOrderDirty === true`.
- `renderOrderDirty = true` po `addRenderable` i skutecznym `removeRenderable`.
- Udostępnić metodę `markRenderOrderDirty()` do ręcznego oznaczenia zmiany porządku.

#### 15.4.6. AppShell: sygnalizacja zmiany wysokości

Plik: `src/app/AppShell.ts`

Wymagania:

- W synchronizacji encja->renderable, jeśli `computedHeight` zmieni się względem poprzedniej wartości, wywołać `worldLayer.markRenderOrderDirty()`.

### 15.5. Kryteria zamknięcia rozszerzenia 5.5.1

| # | Kryterium | Oczekiwany rezultat | Kryterium spełnione? |
|---|---|---|---|
| O1 | Duży viewport wymusza skalę renderu | Dla okna o powierzchni >= 1_600_000 px aktywowana jest skala 0.65 (wejście w tryb large viewport). | Tak |
| O2 | Powrót do jakości 1:1 działa stabilnie | Po zmniejszeniu powierzchni do <= 1_350_000 px skala wraca do 1.0 (próg wyjścia). | Tak |
| O3 | Input myszy poprawny po skali | `mouseWorldPos` odpowiada pozycji kursora na ekranie bez przesunięć. | Tak |
| O4 | Brak sortowania co klatkę bez zmian | `WorldLayer` nie wykonuje `sort()` w każdej klatce przy niezmiennym porządku. | Tak |
| O5 | Sortowanie po zmianie wysokości działa | Po zmianie `computedHeight` render order aktualizuje się poprawnie. | Tak |
| O6 | Build i type-check przechodzą | `npm run type-check` i `npm run build` bez błędów. | Tak |

---

## 16. Rozszerzenie Etapu 5.5 — Stabilizacja renderu (anti-shimmer)

### 16.1. Cel rozszerzenia

Zmniejszyć efekt mikro-drgań (shimmer/jitter) statycznych obiektów podczas płynnego ruchu kamery,
bez utraty płynności obiektów dynamicznych (statek gracza, NPC, pociski, rakiety, lasery).

Rozszerzenie jest kompatybilne z Etapem 5.5 i nie zmienia modelu lotu.

### 16.2. Decyzje architektoniczne rozszerzenia

| ID | Temat | Decyzja |
|---|---|---|
| R5.5-S1 | Klasyfikacja obiektów | **Static snap:** obiekty z encji mających `isStatic === true`. **Dynamic subpixel:** wszystkie pozostałe (`player-ship`, `npc-ship`, przyszłe `projectile`, `missile`, itp.). |
| R5.5-S2 | Miejsce wykonywania snappingu | Snapping wykonywany na poziomie `EntityRenderable.render()` na interpolowanej pozycji, tuż przed `ctx.translate(...)`. |
| R5.5-S3 | Przestrzeń i krok snappingu | Snapping w world-space do pełnego piksela: `x = Math.round(x)`, `y = Math.round(y)`. |
| R5.5-S4 | Zakres warstw | Snapping dotyczy wyłącznie renderables rysowanych przez `WorldLayer`. `BackgroundLayer` i `ParallaxLayer` pozostają bez snappingu. |
| R5.5-S5 | Obiekty przyszłe | Domyślnie wszystkie byty dynamiczne (w tym pociski) pozostają subpixel/interpolowane. |
| R5.5-S6 | Image smoothing | Brak globalnej zmiany `imageSmoothingEnabled` w tym rozszerzeniu. |
| R5.5-S7 | Sterowanie runtime | Dodać dev flag `pixel-snap-static` (checkbox) domyślnie `true`. Wyłączenie flagi przywraca pełny subpixel dla wszystkich bytów. |

### 16.3. Kontrakty techniczne rozszerzenia

#### 16.3.1. Zasada renderowania pozycji

W `EntityRenderable.render(alpha)`:

1. Oblicz `interpolatedPosition` (jak dotychczas).
2. Jeśli renderable jest statyczny **i** `pixel-snap-static === true`, zastosuj:
  - `renderX = Math.round(interpolatedPosition.x)`
  - `renderY = Math.round(interpolatedPosition.y)`
3. Jeśli renderable jest dynamiczny, użyj wartości interpolowanych bez zaokrąglania.
4. `ctx.translate(renderX, renderY)`.

#### 16.3.2. Klasyfikacja static/dynamic

Źródłem prawdy jest encja logiczna podczas tworzenia renderable:

- `isStatic === true` -> klasa renderu `static`.
- w przeciwnym razie -> klasa renderu `dynamic`.

To dotyczy również bytów dodawanych później przez systemy gameplayowe.

#### 16.3.3. Pętla i fizyka

- Symulacja pozostaje float (`number`, bez kwantyzacji pozycji fizycznej).
- Fixed update pozostaje na `60 Hz`.
- Interpolacja (`alpha`) pozostaje aktywna dla renderu dynamicznego.

### 16.4. Testy ręczne rozszerzenia

| ID | Test | Oczekiwany wynik |
|---|---|---|
| SR1 | Włącz `pixel-snap-static=true`, leć statkiem obok stacji/planet | Statyczne obiekty są stabilniejsze wizualnie (mniej shimmeru). |
| SR2 | Włącz `pixel-snap-static=true`, obserwuj statek gracza i ruch NPC | Obiekty dynamiczne pozostają płynne, bez schodkowania. |
| SR3 | Włącz `pixel-snap-static=true`, obserwuj szybki ruch i rotację | Brak regresji płynności lotu. |
| SR4 | Wyłącz `pixel-snap-static` w Dev Overlay | Wszystkie obiekty wracają do pełnego subpixel/interpolacji. |
| SR5 | Sprawdź tło i paralaksę przy ruchu kamery | Brak regresji warstw tła/paralaksy względem Etapu 5.5. |
| SR6 | Po dodaniu pocisków w kolejnych etapach | Pociski renderowane płynnie (bez snappingu), statyczne obiekty nadal stabilne. |
| SR7 | `npm run type-check` + `npm run build` | 0 błędów. |

### 16.5. Kryteria zamknięcia rozszerzenia

| ID | Kryterium | Opis | Kryterium spełnione? |
|---|---|---|---|
| SK1 | Stabilizacja statycznych | Statyczne byty świata nie wykazują odczuwalnego mikro-skakania przy ruchu kamery. | Tak |
| SK2 | Płynność dynamicznych | Statek gracza, NPC i pociski pozostają subpixel/interpolowane. | Sprawdzone ze statkiem gracza tylko i pod to kryterium spelnione Tak |
| SK3 | Brak regresji sceny | Culling, sortowanie, tło, paralaksa i cache działają jak wcześniej. | Tak |
| SK4 | Kontrola dev | Flaga `pixel-snap-static` działa w runtime i natychmiast zmienia zachowanie renderu. | Ledwo widac roznice ale chyyyyba Tak |
| SK5 | Kompilacja | `npm run type-check` i `npm run build` przechodzą bez błędów. | Tak |

---

## 17. Rozszerzenie Etapu 5.5 — Wydajność paralaksy przy dużym viewport

### 17.1. Cel rozszerzenia

Zachować płynność renderu przy bardzo dużych rozmiarach okna, tak aby zwiększanie viewportu
nie powodowało gwałtownego wzrostu kosztu generowania warstw paralaksy.

Zakres rozszerzenia obejmuje wyłącznie `ParallaxLayer` i metryki diagnostyczne w Dev Overlay.

### 17.2. Decyzje architektoniczne rozszerzenia

| ID | Temat | Decyzja |
|---|---|---|
| R5.5-P1 | Zakres optymalizacji | Tylko `ParallaxLayer` (bez zmian w `BackgroundLayer`). |
| R5.5-P2 | Zależność od viewportu | Offscreen tekstura paralaksy ma rozmiar ograniczony capem: `maxTextureWidth = 1600`, `maxTextureHeight = 900`. |
| R5.5-P3 | Strategia jakości | Priorytet: wydajność. Dopuszczalna jest większa powtarzalność wzoru (tiling) przy bardzo dużych oknach. |
| R5.5-P4 | Gęstość cząstek | Dodać jawny parametr `densityMultiplier` do `ParallaxSublayerConfig`. |
| R5.5-P5 | Rola `noiseIntensity` | `noiseIntensity` pozostaje parametrem charakteru szumu (liczność + alpha), ale nie zastępuje jawnej kontroli gęstości. |
| R5.5-P6 | Metryki płynności | Dodać do Dev Overlay metryki: `fps` i `frame ms`. Dla płynności kluczowa jest stabilność `frame ms`; `fps` jest metryką wtórną. |

### 17.3. Kontrakty techniczne rozszerzenia

#### 17.3.1. Rozszerzenie konfiguracji paralaksy

`ParallaxSublayerConfig` dostaje nowe pole:

```ts
interface ParallaxSublayerConfig {
  depthFactor: number;
  tileX: boolean;
  tileY: boolean;
  opacity: number;
  color: string;
  noiseIntensity: number;
  densityMultiplier: number;
}
```

#### 17.3.2. Cap rozmiaru tekstury offscreen

W `ParallaxLayer.render()` generowanie subwarstwy używa rozmiaru:

```txt
textureWidth  = min(viewportWidth,  1600)
textureHeight = min(viewportHeight, 900)
```

Offset i tiling działają jak dotychczas, ale na capowanej teksturze.

#### 17.3.3. Liczność cząstek

W `renderSublayerToCanvas(...)`:

- `dustCount` jest liczony od pola capowanej tekstury,
- wynik jest mnożony przez `densityMultiplier`,
- `noiseIntensity` nadal wpływa na liczność i przezroczystość.
- W aktualnej implementacji brak osobnej puli `wispCount`.

Przykładowa forma:

```txt
dustCount = floor((area / 900) * densityMultiplier * (0.8 + noiseIntensity))
```

#### 17.3.4. Metryki Dev Overlay

Dodać metryki runtime:

- `fps` — wygładzony FPS z `onFrameUpdate(dt, alpha)`.
- `frame ms` — bieżący czas klatki renderowej w milisekundach (`dt * 1000`).

Metryki umieszczone w sekcji `System`.

### 17.4. Testy ręczne rozszerzenia

| ID | Test | Oczekiwany wynik |
|---|---|---|
| PR1 | Ustaw bardzo duży viewport (pełny ekran / duża rozdzielczość) | Brak gwałtownego spadku płynności względem stanu sprzed rozszerzenia. |
| PR2 | Zmień rozmiar okna kilkukrotnie | Brak długich przycięć związanych z regeneracją paralaksy. |
| PR3 | Obserwuj `fps` i `frame ms` w Dev Overlay | Metryki aktualizują się w czasie rzeczywistym. |
| PR4 | Porównaj warianty presetów i `densityMultiplier` | Zmiana gęstości działa bez wpływu na logikę lotu. |
| PR5 | Sprawdź regresję anti-shimmer | Static snapping/dynamic subpixel działają jak w sekcji 16. |
| PR6 | `npm run type-check` + `npm run build` | 0 błędów. |

### 17.5. Kryteria zamknięcia rozszerzenia

| ID | Kryterium | Opis |
|---|---|---|
| PK1 | Cap tekstury działa | `ParallaxLayer` nie tworzy offscreenów większych niż 1600x900. | Tak |
| PK2 | Jawna gęstość działa | `densityMultiplier` steruje licznością generowanych cząstek (`dust`) niezależnie od `noiseIntensity`. | Tak |
| PK3 | Diagnostyka płynności | Dev Overlay pokazuje `fps` i `frame ms`. | Tak |
| PK4 | Brak regresji renderu | Tło, culling, lot i panel dev działają bez regresji funkcjonalnej. | Tak |
| PK5 | Kompilacja | `npm run type-check` i `npm run build` przechodzą bez błędów. | Tak |
