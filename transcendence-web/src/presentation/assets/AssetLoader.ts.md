## Cel pliku
Plik implementuje ladowanie manifestu assetow i preload obrazow. Przechowuje stan zaladowanych oraz nieudanych zasobow i udostepnia statystyki.

## Co eksportuje
- Klasa AssetLoader

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: fetch, Response, Image, Promise.
- Wewnetrzne: src/presentation/assets/assetTypes.ts, src/presentation/assets/validateManifest.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { AssetLoader } from './AssetLoader';

const loader = new AssetLoader();
const manifest = await loader.loadManifest('/art/asset-manifest.json');
if (manifest) {
  await loader.preloadAll();
}
```

## Czego NIE robi
- Nie rejestruje automatycznie profili wizualnych w registry.
- Nie obsluguje ladowania formatow innych niz obraz.
