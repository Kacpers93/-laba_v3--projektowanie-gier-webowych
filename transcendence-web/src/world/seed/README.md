# src/world/seed

## Cel folderu
Pipeline danych seeda: kontrakty, walidacja, przeksztalcenia i ladowanie systemu do runtime.

## Co zawiera
- seedTypes.ts: kontrakty seeda i stale bazowych wysokosci.
- seedTypeMapping.ts: mapowanie typu seeda na EntityCategory.
- orbitUtils.ts: obliczanie pozycji orbitalnej.
- deterministicRandom.ts: deterministyczny PRNG.
- validateSystemSeed.ts: walidacja i normalizacja seeda.
- expandAsteroidGroups.ts: rozwijanie grup asteroid do pojedynczych obiektow.
- SystemSeedLoader.ts: pobieranie, walidacja i rejestracja systemu.
- index.ts: eksport zbiorczy API.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: fetch, Math, performance.
- Wewnetrzne: world/entities, entities/base, presentation/profiles, presentation/renderables, presentation/scene, types.

## Jak uzywac
```ts
import { SystemSeedLoader } from '@world/seed';
```

## Dokumentacja plikowa
- Dokumentacja kazdego pliku jest obok kodu jako .md o tej samej nazwie.

## Czego NIE robi
- Nie rysuje sceny bezposrednio.
- Nie zarzadza petla czasu.
