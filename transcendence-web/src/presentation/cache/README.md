# src/presentation/cache

## Cel folderu
Przechowywanie i ponowne uzycie prerenderowanych tekstur offscreen.

## Co zawiera
- `OffscreenCache.ts`: klasa `OffscreenCache` z `getOrCreate`, `invalidate`, `clear`, `size`, `estimatedBytes`.

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

## Czego NIE robi
- Nie implementuje polityki LRU ani limitu pamieci.
- Nie serializuje cache do dysku.
