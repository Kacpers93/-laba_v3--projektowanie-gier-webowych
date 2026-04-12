# src/presentation/cache

## Cel folderu
Przechowywanie i ponowne uzycie prerenderowanych tekstur offscreen.

## Co zawiera
- `OffscreenCache.ts`: fasada cache z `getOrCreate`, `invalidate`, `clear`, `size`, `estimatedBytes`.
- `EntityCacheBudget.ts`: licznik i limit pamieci dla kluczy bytow.
- `EntityLruIndex.ts`: indeks LRU kluczy bytow.
- `cacheTypes.ts`: wspolne typy i helpery (`CacheEntry`, `isEntityKey`, `estimateEntryBytes`).

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: `OffscreenCanvas`, `OffscreenCanvasRenderingContext2D`.
- Wewnetrzne: wykorzystywane przez warstwy tla i parallax w `scene`.

## Jak uzywac
```ts
const cache = new OffscreenCache();
const canvas = cache.getOrCreate('bg', w, h, (ctx) => {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
});
```

## Dokumentacja plikowa
- OffscreenCache.ts.md
- EntityCacheBudget.ts.md
- EntityLruIndex.ts.md
- cacheTypes.ts.md

## Czego NIE robi
- Nie zarzadza cachem dyskowym ani persystencja.
- Nie serializuje cache do dysku.
