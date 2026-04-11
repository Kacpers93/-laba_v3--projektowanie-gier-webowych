## Cel pliku
Plik implementuje cache OffscreenCanvas dla renderow proceduralnych i tekstur pomocniczych. Zawiera kontrolowany budzet pamieci dla kluczy encji z mechanizmem LRU eviction.

## Co eksportuje
- Klasa OffscreenCache

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: OffscreenCanvas.
- Wewnetrzne: src/presentation/cache/EntityCacheBudget.ts, src/presentation/cache/EntityLruIndex.ts, src/presentation/cache/cacheTypes.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { OffscreenCache } from './OffscreenCache';

const cache = new OffscreenCache();
const canvas = cache.getOrCreate('entity-ship-1', 64, 64, (ctx) => {
  ctx.fillRect(0, 0, 64, 64);
});
```

## Czego NIE robi
- Nie zarzadza assetami sprite ladowanymi z URL.
- Nie serializuje cache miedzy sesjami.
