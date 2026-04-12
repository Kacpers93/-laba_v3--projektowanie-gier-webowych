## Cel pliku
Plik waliduje surowy payload seeda systemu i zwraca oczyszczona strukture danych oraz listy ostrzezen i bledow. Odpowiada za normalizacje i odrzucanie wpisow niezgodnych z kontraktem.

## Co eksportuje
- Interfejs SeedValidationResult
- Funkcja validateSystemSeed(raw): SeedValidationResult

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Set, Map, Number, console.
- Wewnetrzne: src/world/seed/seedTypes.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { validateSystemSeed } from './validateSystemSeed';

const result = validateSystemSeed(rawSeed);
if (!result.valid) {
  console.error(result.errors);
}
```

## Czego NIE robi
- Nie pobiera seeda z sieci.
- Nie instancjonuje encji ani renderables.
