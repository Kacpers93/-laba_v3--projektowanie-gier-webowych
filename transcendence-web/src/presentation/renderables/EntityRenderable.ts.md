## Cel pliku
Plik implementuje domyslny obiekt Renderable dla encji swiata. Odpowiada za interpolacje, rysowanie proceduralne lub sprite i fallback gdy asset nie jest dostepny.

## Co eksportuje
- Klasa EntityRenderable

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CanvasRenderingContext2D.
- Wewnetrzne: src/types/common.ts, src/types/engine.ts, src/presentation/assets/AssetLoader.ts, src/presentation/cache/OffscreenCache.ts, src/presentation/profiles/VisualProfile.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { EntityRenderable } from './EntityRenderable';

const renderable = new EntityRenderable(entity.id, profile, cache, assetLoader);
renderable.syncFromEntity(entity);
renderable.render(ctx, 0.5);
```

## Czego NIE robi
- Nie aktualizuje stanu logicznego encji.
- Nie decyduje o kolejnosci rysowania warstw sceny.
