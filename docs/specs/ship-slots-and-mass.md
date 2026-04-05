# System slotów i masy

> Status: v1.1 — zatwierdzona
> Pliki implementacyjne: `src/entities/ships/shipTypes.ts`, `src/systems/ship-mass/shipMassSystem.ts`

## Definicja statku

```ts
export interface ArmorSlotConfig {
  count: number;
  totalMassLimit: number; // [t]
}

export interface ShipSlots {
  armor: ArmorSlotConfig;
  shield: 1;
  reactor: 1;
  drive: 1;
  weapons: number;
  misc: number;
  cargo: number; // [t]
}

export interface ShipDef {
  id: string;
  name: string;
  hullMass: number;     // [t]
  baseMaxSpeed: number; // [m/s]
  slots: ShipSlots;
}
```

## Obliczanie masy

Jednostka: tony `[t]`.
Objętość nie istnieje.

```txt
totalMass = hullMass
          + sum(installedArmor[].mass)    <= slots.armor.totalMassLimit
          + installedShield.mass
          + installedReactor.mass
          + installedDrive.mass
          + sum(installedWeapons[].mass)
          + sum(installedMisc[].mass)
          + currentCargoMass
```

Przedmioty tego samego typu i tier są stackowalne.

## Wpływ masy na osiągi

```txt
effectiveMaxSpeed = baseMaxSpeed × sqrt(nominalMass / totalMass)
effectiveThrust   = drive.thrust × (nominalMass / totalMass)
```

`nominalMass` = `hullMass + installedDrive.mass`

To są warunki, dla których producent podaje `baseMaxSpeed`.

## Konwersja slotów

| Operacja | Wymaga stacji |
|---|---|
| Cargo slot ↔ Misc slot | tak |
| Instalacja modułu misc / weapon | nie |
| Instalacja modułu podstawowego (armor / shield / reactor / drive) | tak |
| Instalacja specjalnego modułu rozszerzającego sloty | tak, tylko instalacja |

Po konwersji slotu gracz może samodzielnie instalować i wymieniać moduły.

## Poza zakresem

Ten moduł nie:
- oblicza fizyki lotu,
- zarządza stanem reaktora,
- obsługuje przejęcia statku.