## Pliki bazowe

Poniżej jest gotowa baza dla typów i helpera paliwa, już z poprawionymi importami względnymi i bez mieszania runtime state do katalogu contentu.

### `src/items/reactors/base/reactorTypes.ts`

```ts
export type FuelCategory = 'hydrogen' | 'helium3' | 'astrofage';

export interface FuelAccepted {
  type: FuelCategory;
  tierMin: number;
  tierMax: number;
}

export interface ReactorDef {
  id: string;
  name: string;
  description: string;
  lore?: string;
  sprite?: string;
  maxPower: number;   // MW
  efficiency: number; // mnożnik wyciągu energii z paliwa
  tankSize: number;   // pojemność zbiornika [j]
  acceptedFuel: FuelAccepted[];
}
```


### `src/items/reactors/base/reactorFuels.ts`

```ts
import type { FuelCategory } from './reactorTypes';

const FUEL_BASE: Record<FuelCategory, number> = {
  hydrogen: 1000,
  helium3: 5000,
  astrofage: 500000,
};

const TIER_MULT = 1.5;

export function fuelEnergyDensity(type: FuelCategory, tier: number): number {
  if (tier < 1) {
    throw new Error(`Invalid fuel tier: ${tier}`);
  }

  return Math.round(FUEL_BASE[type] * TIER_MULT ** (tier - 1));
}
```


## Katalog reaktorów

Tu każdy reaktor jest osobnym plikiem contentowym, a `index.ts` jest jedynym miejscem składania pełnej listy.

### `src/items/reactors/catalog/proton-40.ts`

```ts
import type { ReactorDef } from '../base/reactorTypes';

const proton40: ReactorDef = {
  id: 'proton-40',
  name: 'Proton-40 Fission Core',
  description: 'Standard hydrogen fission reactor. Cheap, widely available, low efficiency.',
  maxPower: 40,
  efficiency: 0.7,
  tankSize: 2500,
  acceptedFuel: [{ type: 'hydrogen', tierMin: 1, tierMax: 6 }],
};

export default proton40;
```


### `src/items/reactors/catalog/nova-80.ts`

```ts
import type { ReactorDef } from '../base/reactorTypes';

const nova80: ReactorDef = {
  id: 'nova-80',
  name: 'Nova-80 Hybrid Core',
  description: 'Accepts high-grade hydrogen or low-grade helium-3. A common mid-tier upgrade.',
  maxPower: 80,
  efficiency: 0.9,
  tankSize: 8000,
  acceptedFuel: [
    { type: 'hydrogen', tierMin: 5, tierMax: 10 },
    { type: 'helium3', tierMin: 1, tierMax: 4 },
  ],
};

export default nova80;
```


### `src/items/reactors/catalog/helion-150.ts`

```ts
import type { ReactorDef } from '../base/reactorTypes';

const helion150: ReactorDef = {
  id: 'helion-150',
  name: 'Helion-150 Fusion Core',
  description: 'Dedicated helium-3 fusion reactor. Requires refined fuel but delivers stable output.',
  maxPower: 150,
  efficiency: 1.1,
  tankSize: 20000,
  acceptedFuel: [{ type: 'helium3', tierMin: 3, tierMax: 7 }],
};

export default helion150;
```


### `src/items/reactors/catalog/fusion-300.ts`

```ts
import type { ReactorDef } from '../base/reactorTypes';

const fusion300: ReactorDef = {
  id: 'fusion-300',
  name: 'Fusion-300 High-Grade Core',
  description: 'Military-grade helium-3 reactor. Requires highly refined fuel.',
  maxPower: 300,
  efficiency: 1.3,
  tankSize: 60000,
  acceptedFuel: [{ type: 'helium3', tierMin: 6, tierMax: 10 }],
};

export default fusion300;
```


### `src/items/reactors/catalog/plasma-600.ts`

```ts
import type { ReactorDef } from '../base/reactorTypes';

const plasma600: ReactorDef = {
  id: 'plasma-600',
  name: 'Plasma-600 Quantum Reactor',
  description: 'Late-game reactor. Accepts top-tier helium-3 or astrofage canisters.',
  maxPower: 600,
  efficiency: 1.6,
  tankSize: 150000,
  acceptedFuel: [
    { type: 'helium3', tierMin: 8, tierMax: 10 },
    { type: 'astrofage', tierMin: 1, tierMax: 1 },
  ],
};

export default plasma600;
```


### `src/items/reactors/catalog/astrcore-1000.ts`

```ts
import type { ReactorDef } from '../base/reactorTypes';

const astrcore1000: ReactorDef = {
  id: 'astrcore-1000',
  name: 'Astrcore-1000 Singularity Core',
  description: 'Experimental 1 GW reactor. Runs exclusively on astrofage. Extremely rare.',
  maxPower: 1000,
  efficiency: 2.0,
  tankSize: 360000,
  acceptedFuel: [{ type: 'astrofage', tierMin: 1, tierMax: 1 }],
};

export default astrcore1000;
```


### `src/items/reactors/index.ts`

```ts
import type { ReactorDef } from './base/reactorTypes';
import proton40 from './catalog/proton-40';
import nova80 from './catalog/nova-80';
import helion150 from './catalog/helion-150';
import fusion300 from './catalog/fusion-300';
import plasma600 from './catalog/plasma-600';
import astrcore1000 from './catalog/astrcore-1000';

export const ALL_REACTORS: ReactorDef[] = [
  proton40,
  nova80,
  helion150,
  fusion300,
  plasma600,
  astrcore1000,
];

export function getReactorDef(id: string): ReactorDef {
  const def = ALL_REACTORS.find((reactor) => reactor.id === id);

  if (!def) {
    throw new Error(`Unknown reactor id: ${id}`);
  }

  return def;
}
```


## Runtime system

Ten plik powinien siedzieć osobno w `src/systems/reactor/`, bo `ReactorState` i operacje typu `drain` albo `refuel` są stanem oraz logiką runtime, a nie contentem katalogowym.

### `src/systems/reactor/reactorSystem.ts`

```ts
import type { FuelCategory, ReactorDef } from '../../items/reactors/base/reactorTypes';
import { fuelEnergyDensity } from '../../items/reactors/base/reactorFuels';

export const BASE_RATE = 100;

export type ReactorConsumerGroup = 'thrusters' | 'shields' | 'weapons' | 'misc';

export const REACTOR_POWER_PRIORITY: ReactorConsumerGroup[] = [
  'thrusters',
  'shields',
  'weapons',
  'misc',
];

export interface ReactorState {
  defId: string;
  currentEnergy: number; // [0..tankSize]
  damaged: boolean;      // true => efficiency × 0.8, maxPower × 0.8
}

export function createReactorState(def: ReactorDef, fillPercent = 1): ReactorState {
  const clampedFill = Math.max(0, Math.min(1, fillPercent));

  return {
    defId: def.id,
    currentEnergy: Math.round(def.tankSize * clampedFill),
    damaged: false,
  };
}

export function effectiveEfficiency(def: ReactorDef, state: ReactorState): number {
  return state.damaged ? def.efficiency * 0.8 : def.efficiency;
}

export function effectiveMaxPower(def: ReactorDef, state: ReactorState): number {
  return state.damaged ? def.maxPower * 0.8 : def.maxPower;
}

export function acceptsFuel(
  def: ReactorDef,
  fuelType: FuelCategory,
  fuelTier: number
): boolean {
  return def.acceptedFuel.some(
    (fuel) =>
      fuel.type === fuelType &&
      fuelTier >= fuel.tierMin &&
      fuelTier <= fuel.tierMax
  );
}

export function drainReactor(
  state: ReactorState,
  def: ReactorDef,
  drawMW: number
): void {
  if (drawMW <= 0 || state.currentEnergy <= 0) {
    return;
  }

  const eff = effectiveEfficiency(def, state);
  const drain = drawMW / (eff * BASE_RATE);

  state.currentEnergy = Math.max(0, state.currentEnergy - drain);
}

export function refuel(
  state: ReactorState,
  def: ReactorDef,
  fuelType: FuelCategory,
  fuelTier: number
): boolean {
  if (!acceptsFuel(def, fuelType, fuelTier)) {
    return false;
  }

  const energy = fuelEnergyDensity(fuelType, fuelTier);
  state.currentEnergy = Math.min(def.tankSize, state.currentEnergy + energy);

  return true;
}

export function fuelPercent(state: ReactorState, def: ReactorDef): number {
  if (def.tankSize <= 0) {
    return 0;
  }

  return state.currentEnergy / def.tankSize;
}

export function isReactorDepleted(state: ReactorState): boolean {
  return state.currentEnergy <= 0;
}
```
