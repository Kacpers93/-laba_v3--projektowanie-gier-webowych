## Cel pliku
Plik przechowuje manifest assetow graficznych ladowanych przez AssetLoader. Definiuje metadane sprite'ow i parametry renderowania wykorzystywane przy rejestracji profili.

## Co eksportuje
Plik niczego nie eksportuje (plik danych JSON).

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: odczytywany przez src/presentation/assets/AssetLoader.ts; walidowany przez src/presentation/assets/validateManifest.ts; mapowany do profili przez src/presentation/assets/registerManifestProfiles.ts.

## Jak uzywac (minimalny przyklad)
```ts
const manifest = await assetLoader.loadManifest('/art/asset-manifest.json');
```

## Czego NIE robi
- Nie laduje obrazow samodzielnie.
- Nie zawiera definicji logiki encji ani sceny.
