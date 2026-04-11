# Etap 5.5 — Architektura Świata i Wrota

> Status: v1.0 — specyfikacja
> Pliki implementacyjne: `src/world/`, `src/systems/gates/`, `src/systems/spawn/`

## Cel

Etap 5.5 definiuje strukturę świata gry na poziomie makro: systemy, sektory, wrota, obiekty w systemach oraz reguły spawnu i widoczności. Ustanawia kontrakty pozwalające na łączenie bytów w sensowne grupy, przechodzenie między systemami oraz zarządzanie ilością jednostek w danym obszarze.

Zakres względem Etapu 5: Etap 5.5 rozszerza model świata o wielosystemowość, sektory i przejścia; nie redefiniuje formatu seeda pojedynczego systemu startowego z Etapu 5.

Po zamknięciu Etapu 5.5 Etap 6 (systemy gameplayowe) może pracować na założeniu, że świat ma znaną strukturę i obiekty można przechodzić między systemami bez utraty synchronizacji.

---

## 1. Architektura światowa — hierarchia

### Hierarchia

```
Universe
  └─ Sector (kilka systemów tematycznie/geograficznie powiązanych)
      ├─ reputation_floor (liczba 0-5 = dostęp do modulów)
      ├─ SystemRef[] (np. 3–8 systemów na sektor)
      │
      └─ System (kontener dla obiektów: gwiazdka, planety, stacje, pola)
          ├─ max_units (spawnów limit w tym systemie)
          ├─ current_unit_count (bieżąca liczba)
          |
          ├─ CelestialBody[] (gwiazda, planety, księżyce)
          ├─ Station[] (duże stacje, mine, fabryki)
          ├─ AsteroidField[] (pola do miningu + spawny asteroidy)
          ├─ Gate[] (wrota do sąsiednich systemów)
          │
          └─ MovingUnit[] (statki gracza, NPC, projektyle — dynamiczne)
```

### Sektor — definicja

```typescript
// world/sector/SectorDef.ts

export interface SectorDef {
  id: string;
  name: string;
  description?: string;
  
  // Ranking dostępu do modulów i sprzętu
  reputationFloor: number; // 0-5, im wyżej tym lepsze moduły
  
  // Systemy należące do tego sektora
  systemIds: string[];
}
```

### System — definicja

```typescript
// world/system/SystemDef.ts

export interface SystemDef {
  id: string;
  name: string;
  description?: string;
  
  // Limit jednostek (statki, projektyle, stermy)
  maxUnits: number;
  currentUnitCount: number;
  
  // Obiekty statyczne
  celestialBodies: CelestialBodyDef[];
  stations: StationDef[];
  asteroidFields: AsteroidFieldDef[];
  gates: GateDef[];
}

export interface CelestialBodyDef {
  id: string;
  type: 'star' | 'planet' | 'moon' | 'asteroid';
  name: string;
  position: Vector2;
  radius: number;
  sprite?: string;
}

export interface StationDef {
  id: string;
  name: string;
  position: Vector2;
  factionId: string;
  slots: ShipSlot[]; // gdzie mogu spawnerami być statki
  shop?: ShopDef;   // moduły dostępne do kupienia
}

export interface AsteroidFieldDef {
  id: string;
  position: Vector2;
  radius: number;
  density: number;    // ~ile asteroid na jednostkę powierzchni
  mineralType: MineralType;
  spawnRate: number;  // asteroid/s
}

export interface GateDef {
  id: string;
  position: Vector2;
  targetSystemId: string;
  targetGateId: string; // wrota w systemie docelowym
  radius: number;       // detekcja wejścia do wrót
}
```

---

## 2. Maksymalny rozmiar systemu

### Definicja

Każdy system ma zdefiniowany **maksymalny rozmiar mapy** (spatial bounds).

```typescript
// world/system/SystemBounds.ts

export interface SystemBounds {
  /** Wymiar mapy (kwadratowy) [px] */
  size: number;
  
  /** Środek systemu w world coords */
  center: Vector2;
}

// Przykład: System 50km × 50km
const DefaultSystemBounds: SystemBounds = {
  size: 50000,      // pixel = 1 km
  center: { x: 25000, y: 25000 }
};
```

### Zasada

- Każdy system ma określone granice (`SystemDef.bounds`).
- Obiekty statyczne (stacje, planety, pola asteroid) muszą być umieszczone **wewnątrz** tych granic.
- Wrota do systemów sąsiednich są umieszczone **blisko krawędzi** — aby gracz naturalnie przechodzący przez mapę odkrywał je.
- **Jednostki dynamiczne** (statki gracza, NPC, projektyle) mogą wychodzić poza granice tymczasowo, ale są rozliczane w limit `currentUnitCount` dopóki pozostają w systemie.

---

## 3. Przechodzenie przez wrota — zmiana systemu

### Detektor wejścia

Wrota to dyski w świecie z radiusem detekcji.

```typescript
// world/gates/GateDetection.ts

export interface GateCollision {
  gateId: string;
  unitId: string;
  targetSystemId: string;
  targetGateId: string;
}

function checkGateCollision(unit: MovingUnit, gates: GateDef[]): GateCollision | null {
  for (const gate of gates) {
    const dist = Vector2.distance(unit.position, gate.position);
    if (dist < gate.radius) {
      return {
        gateId: gate.id,
        unitId: unit.id,
        targetSystemId: gate.targetSystemId,
        targetGateId: gate.targetGateId
      };
    }
  }
  return null;
}
```

### Przejście — rzeczywisty przepływ

```typescript
// world/gates/GateTransition.ts

export interface TransitionInProgress {
  unitId: string;
  fromSystemId: string;
  toSystemId: string;
  fromGateId: string;
  toGateId: string;
  transitionStart: number; // timestamp
  duration: number;        // ms
}

export async function transitionUnit(
  unit: MovingUnit,
  sourceGate: GateDef,
  targetSystemId: string,
  targetGateId: string,
  sourceSystem: SystemDef,
  targetSystem: SystemDef
): Promise<void> {
  // 1. Usunąć jednostkę ze źródłowego systemu
  sourceSystem.currentUnitCount--;
  
  // 2. Sprawdzić limit w systemie docelowym
  if (targetSystem.currentUnitCount >= targetSystem.maxUnits) {
    // Gracz widzi komunikat "System pełny"
    throw new Error(`System ${targetSystemId} reached unit limit`);
  }
  
  // 3. Zmienić pozycję jednostki (spawningiem przy bramie docelowej)
  const targetGate = getGateById(targetGateId);
  unit.position = Vector2.add(targetGate.position, { x: 200, y: 0 }); // safe offset
  unit.systemId = targetSystemId;
  
  // 4. Zsynchronizować prędkość (kierunek przejścia)
  // Jeśli gracz przyszedł z kierunku osemki, wychodzi w podobnym kierunku
  unit.velocity = Vector2.normalize(Vector2.subtract(targetGate.position, sourceGate.position));
  unit.velocity = Vector2.scale(unit.velocity, 500); // ~500 px/s
  
  // 5. Dodać do docelowego systemu
  targetSystem.currentUnitCount++;
  
  // 6. Emit event — UI pokazuje "Wjechałem do [SystemName]"
  EventBus.emit('UnitSystemChanged', { unitId: unit.id, newSystem: targetSystemId });
}
```

### Szczególny przypadek: gracz przechodzi wrota

Gdy gracz przechodzi wrota:
1. **Jego statek** przechodzi do systemu docelowego (standardowa procedura wyżej).
2. **Wszystkie pozostałe obiekty w danym systemie** (statki NPC, asteroidy, projektyle) są **niezaburzane**.
3. **Kamera podąża** za graczem do nowego systemu.
4. Stary system przestaje być renderowany (byt logiczny pozostaje w tle).

---

## 4. Obiekty w systemie — specification

Każdy system zawiera:

| Typ obiektu | Ilość | Spawning? | Ruchomość | Przykład |
|---|---|---|---|---|
| **Gwiazdy** | 1 | Nie | Nie | Białe karły, Główne ciągi |
| **Planety/Księżyce** | 1–4 | Nie | Nie (orbity są wizualne) | Mars, Io, Luna |
| **Stacje** | 2–8 | Nie (rozmieszczone przy budowie sektora) | Nie | Fabryka, Fort, Station Handlowa |
| **Pola asteroid** | 1–3 | Są źródłami spawnu asteroid | Asteroidy mi rozsiane | Pas Asteroid, Pole Przechodni |
| **Wrota** | 1–4 | Nie | Nie | Fioletowy portal na krawędzi |

---

## 5. Sektor — system reputacji i modulów

### Definicja

Sektor grupuje kilka systemów tematycznie. Każdy sektor ma **reputation_floor** (0–5):
- `0` = początkowy, tanio
- `5` = zaawansowany, drogi

```typescript
// world/sector/ReputationGating.ts

export enum ReputationTier {
  Starter = 0,     // tech bazowa
  Advanced = 1,    // ulepszone moduły
  HighTech = 2,    // technologia zaawansowana
  Military = 3,    // sprzęt militarny
  Experimental = 4, // prototypy
  Legendary = 5    // rzadkie, unikatowe
}

export function getMmoduleslAvailableInSector(sectorDef: SectorDef): ModuleBundle[] {
  return ALL_MODULES.filter(m => m.requiredReputation <= sectorDef.reputationFloor);
}
```

### Integracja z handlem

Każda stacja w sektorze ma dostęp do modulów określonych przez `sectorDef.reputationFloor`. Gracz nie kupuje bardziej zaawansowanych modulów aż do tego sektora.

---

## 6. Jednostki dynamiczne — przejście przez wrota

### Definicja jednostki dynamicznej

Jednostka dynamiczna to każdy obiekt mogący się poruszać:
- Statki gracza / NPC
- Projektyle
- Stermy
- Drony

```typescript
// world/units/MovingUnit.ts

export interface MovingUnit {
  id: string;
  category: 'ship' | 'projectile' | 'swarm' | 'drone';
  
  // Lokalizacja
  systemId: string;
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  
  // Fizyka
  radius: number;
  mass: number;
  
  // Opakowanie
  factionId?: string;
  owner?: string;  // gracz/AI
  
  alive: boolean;
}
```

### Widoczność po przejściu wrót

**Zasada: Jednostki są widoczne między systemami tylko jeśli obaj gracze znajdują się w systemach bezpośrednio połączonych bramami i oba są widoczne na ich ekranach.**

```typescript
// world/gates/VisibilityAcrossGates.ts

export function getVisibleUnitsAcrossGate(
  viewerSystemId: string,
  viewerGateId: string,
  targetSystemId: string
): MovingUnit[] {
  // 1. Znaleźć wrota w systemie widza
  const sourceGate = getGateById(viewerGateId);
  if (!sourceGate || sourceGate.targetSystemId !== targetSystemId) {
    return []; // Wrota nie prowadzą do tamtego systemu
  }
  
  // 2. Znaleźć wrota docelowe
  const targetGate = getGateById(sourceGate.targetGateId);
  
  // 3. Zwrócić jednostki w systemie docelowym blisko wrot
  const targetSystem = getSystem(targetSystemId);
  return targetSystem.units.filter(u => {
    const distToGate = Vector2.distance(u.position, targetGate.position);
    return distToGate < 1000; // 1km od wrót
  });
}
```

### Praktyka: Gracz przechodzi wrota i widzi przeciwnika

1. Gracz A przechodzi wrota do Systemu B.
2. W Systemie A pozostaje przeciwnik B (nie jest widoczny).
3. Gracz A widzi teraz Systemy B (normalnie) oraz częściowo System A przez wrota (jednostki 1km od bramy A).
4. Jeśli Gracz A widzi Przeciwnika B przez wrota, może do niego strzelać (projektyle przecodzą przez wrota).
5. Gdy Przeciwnik B przejdzie wrota do Systemu B, staje się w pełni synchronizowany.

---

## 7. Spawnowanie jednostek — reguły

### Limit globalny

```typescript
// world/spawn/SpawnLimits.ts

export interface SpawnLimits {
  systemId: string;
  maxUnits: number;           // Limit dla całego systemu
  currentUnitCount: number;
}

function canSpawnUnit(system: SystemDef): boolean {
  return system.currentUnitCount < system.maxUnits;
}
```

### Źródła spawnu

Jednostki mogą spawnować **wyłącznie** z określonych miejsc:

| Źródło | Typ jednostki | Reguła |
|---|---|---|
| **Duża stacja** | Statek gracz, NPC krążownik | `canSpawn: true` — respект 5–20 minut |
| **Baza kosmiczna** | Drony obrony, patrole | `canSpawn: true` — respekt 2–5 minut |
| **Ciało niebieskie** (planeta) | Asteroidy (jeśli pole asteroid) | ciągły spawn, zależy od `spawnRate` |
| **Gracz** | Eksplosja, fragmenty | `canSpawn: true` — jeśli gracz zniszczony |

```typescript
// world/spawn/SpawnerDef.ts

export interface Spawner {
  id: string;
  type: 'station' | 'base' | 'asteroid_field' | 'environment';
  systemId: string;
  position: Vector2;
  
  enabled: boolean;
  spawnRatePerMinute: number;
  maxActiveUnits: number;      // Ile maksymalnie może mieć tego spawnera na świcie
  lastSpawnTime: number;
}

export interface SpawnRequest {
  spawnerId: string;
  unitCategory: 'ship' | 'projectile' | 'swarm' | 'environment';
  count: number;
}

function processSpawn(spawner: Spawner, system: SystemDef): SpawnRequest[] {
  if (!spawner.enabled) return [];
  if (!canSpawnUnit(system)) return []; // System pełny
  if (time - spawner.lastSpawnTime < 60 / spawner.spawnRatePerMinute * 1000) {
    return []; // Czekaj na kolejny spawn
  }
  
  spawner.lastSpawnTime = time;
  return [
    {
      spawnerId: spawner.id,
      unitCategory: 'ship',
      count: Math.min(spawner.maxActiveUnits, (system.maxUnits - system.currentUnitCount))
    }
  ];
}
```

### Szczególny przypadek: Asteroidy z pola

```typescript
// world/spawn/AsteroidSpawner.ts

function spawnAsteroidsFromField(
  field: AsteroidFieldDef,
  system: SystemDef
): AsteroidSpawnResult {
  const timePassedMs = time - field.lastSpawnTime;
  const asteroidCount = Math.floor(
    field.spawnRate * (timePassedMs / 1000)
  );
  
  if (isSystemAtLimit(system)) {
    return { spawned: 0, reason: 'system_full' };
  }
  
  const toSpawn = Math.min(asteroidCount, system.maxUnits - system.currentUnitCount);
  
  for (let i = 0; i < toSpawn; i++) {
    const pos = randomPointInRadius(field.position, field.radius);
    const unit = createAsteroid({
      position: pos,
      velocity: randomVector(),
      mineralType: field.mineralType,
      systemId: system.id
    });
    system.units.push(unit);
    system.currentUnitCount++;
  }
  
  return { spawned: toSpawn, reason: 'ok' };
}
```

---

## 8. Kryteria zamknięcia Etapu 5.5

- [ ] Zdefiniować `SectorDef` i `SystemDef` w `src/world/`.
- [ ] Zdefiniować `CelestialBodyDef`, `StationDef`, `AsteroidFieldDef`, `GateDef`.
- [ ] Zaimplementować `GateDetection` — kolizja jednostki z bramą.
- [ ] Zaimplementować `transitionUnit()` — zmiana systemów atomowo.
- [ ] Zaimplementować `getVisibleUnitsAcrossGate()` — widoczność przez bramy.
- [ ] Zdefiniować `Spawner` i `SpawnLimits`.
- [ ] Zaimplementować `processSpawn()` — walidacja spawn limitów.
- [ ] Zaimplementować `spawnAsteroidsFromField()` — spawn asteroidy z pól.
- [ ] Dodać `reputation_floor` na stronie sektora → gating modulów w sklepach stacji.
- [ ] Testy integracyjne: przejście gracza przez wrota, spawn przy limicie, asteroidy z pola.

---

## 9. Warianty i wyłączenia

### Wariant: Wrota dwukierunkowe

Wrota mogą być **symetryczne** (obie strony wiedą w obydwie strony) lub **asymetryczne** (A→B, ale B ma osobne wrota do C).

Domyślnie: symetryczne.

### Wariant: Asteroidy dynamiczne

Asteroidy mogą być spawniane dynamicznie z pól (obecna specyfikacja) lub **przedspawniane statycznie** przy ładowaniu sektora. Domyślnie: dynamiczne (scheduler spawnu co klatkę).

---

## 10. Powiązania z innymi etapami

- **Etap 3**: `GameEntity` — każda jednostka dynamiczna musi implementować `GameEntity`.
- **Etap 4**: `VisualProfile` — wrota, stacje, ciała niebieskie mają profile wizualne.
- **Etap 6**: Systemy gameplayowe (reaktor, lot, zbieranie) pracują na założeniu synchronizacji w systemie i limitu jednostek.
- **Etap 7**: UI pokazuje aktualny system gracza, mapę sektora i dostępne moduły.
