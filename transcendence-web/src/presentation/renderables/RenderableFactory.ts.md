## Cel pliku
Plik tworzy obiekty Renderable na podstawie encji i profilu wizualnego. Jest centralnym miejscem spinania danych encji z warstwa prezentacji.

## Co eksportuje
- Klasa RenderableFactory

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/types/engine.ts, src/presentation/assets/AssetLoader.ts, src/entities/base/GameEntity.ts, src/presentation/cache/OffscreenCache.ts, src/presentation/profiles/VisualProfile.ts, src/presentation/renderables/EntityRenderable.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { RenderableFactory } from './RenderableFactory';

const factory = new RenderableFactory(cache, assetLoader);
const renderable = factory.create(entity, profile);
```

## Czego NIE robi
- Nie zarzadza przechowywaniem renderables po utworzeniu.
- Nie wykonuje cullingu i rysowania klatek.
