# src/presentation/assets

## Cel folderu
Obsluga manifestu assetow i mapowanie wpisow manifestu do profili wizualnych.

## Co zawiera
- assetTypes.ts: kontrakty danych manifestu.
- validateManifest.ts: walidacja danych manifestu.
- AssetLoader.ts: pobranie manifestu i preload obrazow.
- registerManifestProfiles.ts: rejestracja profili na podstawie manifestu.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: fetch, Image.
- Wewnetrzne: presentation/profiles.

## Jak uzywac
```ts
const manifest = await assetLoader.loadManifest('/art/asset-manifest.json');
```

## Dokumentacja plikowa
- AssetLoader.ts.md
- assetTypes.ts.md
- validateManifest.ts.md
- registerManifestProfiles.ts.md

## Czego NIE robi
- Nie zarzadza renderowaniem obiektow.
- Nie przechowuje danych seeda swiata.
