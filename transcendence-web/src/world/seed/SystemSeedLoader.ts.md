## Cel pliku
Plik implementuje loader systemu: pobiera seed, waliduje dane, oblicza pozycje obiektow, rozwija grupy asteroid i rejestruje encje oraz renderables. Zawiera tez logike rozladowania aktualnego systemu.

## Co eksportuje
- Interfejs SystemLoadResult
- Klasa SystemSeedLoader

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: fetch, Response, performance, console, Math.
- Wewnetrzne: src/types/common.ts, src/types/engine.ts, src/entities/base/EntityCategory.ts, src/entities/base/EntityManager.ts, src/presentation/profiles/VisualProfile.ts, src/presentation/profiles/VisualProfileRegistry.ts, src/presentation/renderables/RenderableFactory.ts, src/presentation/scene/WorldLayer.ts, src/world/entities/index.ts, src/world/seed/expandAsteroidGroups.ts, src/world/seed/orbitUtils.ts, src/world/seed/seedTypeMapping.ts, src/world/seed/seedTypes.ts, src/world/seed/validateSystemSeed.ts.

## Jak uzywac (minimalny przyklad)
```ts
const loader = new SystemSeedLoader(
  entityManager,
  visualProfileRegistry,
  renderableFactory,
  worldLayer,
  renderablesByEntityId,
);

const result = await loader.loadSystem('/world/systems/sol-001.json');
```

## Czego NIE robi
- Nie zarzadza petla gry.
- Nie obsluguje wielosystemowego streamingu sektorow.
