# public/art

## Cel folderu
Zasoby graficzne i manifest assetow wykorzystywany przez warstwe presentation.

## Co zawiera
- asset-manifest.json: lista assetId, kategorii, URL i metadanych frame/worldSize/cullRadius/version.
- podfoldery z plikami PNG: ships, stations, gates, celestial.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: odczyt przez src/presentation/assets/AssetLoader.ts.

## Jak uzywac
Manifest jest ladowany z URL /art/asset-manifest.json.

## Dokumentacja plikowa
- asset-manifest.json.md
- Dla plikow binarnych PNG dokumentacja per plik nie jest tworzona.

## Czego NIE robi
- Nie zawiera kodu renderowania.
- Nie przechowuje danych logiki swiata.
