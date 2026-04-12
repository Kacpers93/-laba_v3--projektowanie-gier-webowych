# src/presentation/renderables

## Cel folderu
Tworzenie i implementacja obiektow renderowalnych encji.

## Co zawiera
- EntityRenderable.ts: implementacja Renderable z interpolacja i renderem sprite/procedural.
- RenderableFactory.ts: fabryka Renderable na podstawie encji i profilu.
- index.ts: eksport zbiorczy.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Canvas 2D API.
- Wewnetrzne: types, assets, cache, profiles, entities/base.

## Jak uzywac
```ts
import { RenderableFactory } from '@presentation/renderables';
```

## Dokumentacja plikowa
- EntityRenderable.ts.md
- RenderableFactory.ts.md
- index.ts.md

## Czego NIE robi
- Nie zarzadza lista renderables warstwy swiata.
- Nie odpowiada za culling calej sceny.
