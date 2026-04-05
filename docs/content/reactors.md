# Katalog reaktorów

## Cel

Ten dokument opisuje organizację contentu reaktorów.
Każdy reaktor końcowo ma być osobnym plikiem w `src/items/reactors/catalog/`.

## Struktura

```txt
src/
└── items/
    └── reactors/
        ├── base/
        │   ├── reactorTypes.ts
        │   └── reactorFuels.ts
        ├── catalog/
        │   ├── proton-40.ts
        │   ├── nova-80.ts
        │   ├── helion-150.ts
        │   ├── fusion-300.ts
        │   ├── plasma-600.ts
        │   └── astrcore-1000.ts
        └── index.ts
```

## Reguły

- Jeden plik = jeden reaktor.
- Pliki katalogu zawierają tylko statyczny content.
- W plikach katalogu nie trzymamy `ReactorState`.
- W plikach katalogu nie trzymamy logiki `drain`, `refuel` ani `fuelPercent`.
- Każdy plik eksportuje jeden `default`.
- `index.ts` składa pełny rejestr wszystkich reaktorów.
- Importy są względne.

## Minimalny szablon pliku

```ts
import type { ReactorDef } from '../base/reactorTypes';

const exampleReactor: ReactorDef = {
  id: 'example-reactor',
  name: 'Example Reactor',
  description: 'Short gameplay description.',
  maxPower: 10,
  efficiency: 1,
  tankSize: 1000,
  acceptedFuel: [{ type: 'hydrogen', tierMin: 1, tierMax: 1 }],
};

export default exampleReactor;
```

## Zakres pól

### Obowiązkowe
- `id`
- `name`
- `description`
- `maxPower`
- `efficiency`
- `tankSize`
- `acceptedFuel`

### Opcjonalne
- `lore`
- `sprite`

## Nazewnictwo

- ID w `kebab-case`
- nazwa pliku zgodna z `id`
- brak spacji i wersji typu `reactor01-final-final`

## Uwaga wykonawcza

Jeżeli później ustalisz wspólny model itemów z masą, wartością i tierem,
to te pola trzeba dodać w jednym miejscu: do `reactorTypes.ts`,
a potem uzupełnić każdy plik katalogu osobno.