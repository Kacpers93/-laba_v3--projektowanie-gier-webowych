# System reaktora

> Status: v1.1 — zatwierdzona
> Pliki implementacyjne: `src/items/reactors/base/reactorTypes.ts`, `src/items/reactors/base/reactorFuels.ts`, `src/systems/reactor/reactorSystem.ts`

## Typy paliwa

```ts
export type FuelCategory = 'hydrogen' | 'helium3' | 'astrofage';
```

| Paliwo | Gęstość energii bazowa [j] | Dostępność |
|---|---|---|
| `hydrogen` | 1000 | Powszechne, tanie |
| `helium3` | 5000 | Średnie, wymaga rafinacji |
| `astrofage` | 500000 | Rzadkie, bardzo drogie |

Każdy tier zwiększa gęstość energii:
`baseEnergy × 1.5^(tier - 1)`

## Definicja reaktora

```ts
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
  maxPower: number;   // [MW]
  efficiency: number; // mnożnik wyciągu energii z paliwa
  tankSize: number;   // [j]
  acceptedFuel: FuelAccepted[];
}
```

## Stan runtime

```ts
export interface ReactorState {
  defId: string;
  currentEnergy: number; // [0..tankSize]
  damaged: boolean;      // true => efficiency × 0.8, maxPower × 0.8
}
```

## Kluczowe funkcje

```ts
function effectiveEfficiency(def: ReactorDef, state: ReactorState): number
function effectiveMaxPower(def: ReactorDef, state: ReactorState): number
function drainReactor(state: ReactorState, def: ReactorDef, drawMW: number): void
function refuel(state: ReactorState, def: ReactorDef, fuelType: FuelCategory, fuelTier: number): boolean
function fuelPercent(state: ReactorState, def: ReactorDef): number
```

## Zasady działania

- Uszkodzony reaktor ma `efficiency × 0.8`.
- Uszkodzony reaktor ma `maxPower × 0.8`.
- Gdy `currentEnergy <= 0`, wszystkie systemy są wyłączone.
- Tankowanie zwraca `false`, jeśli paliwo nie mieści się w `acceptedFuel`.

## Priorytet rozdziału mocy

Przy niedoborze mocy kolejność zasilania jest stała:

1. Thrustery
2. Tarcze
3. Broń
4. Misc devices

## Katalog reaktorów

Lista konkretnych reaktorów nie należy do tej specyfikacji.
Katalog contentu siedzi w `docs/content/reactors.md` i w `src/items/reactors/catalog/`.

## Reguła importów

Wszystkie importy używają ścieżek względnych.
Nie używamy bare names typu `reactorTypes`.

## Poza zakresem

Ten moduł nie:
- oblicza fizyki lotu,
- zarządza slotami statku,
- definiuje ekonomii stacji,
- przechowuje katalogu wszystkich egzemplarzy reaktorów.