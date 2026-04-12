# public

## Cel folderu
Statyczne zasoby serwowane przez Vite bezposrednio pod rootem URL.

## Co zawiera
- art/: manifest i pliki graficzne.
- world/: dane seeda systemow.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: odczyt przez AssetLoader i SystemSeedLoader.

## Jak uzywac
Pliki sa dostepne przez sciezki URL, np. /art/asset-manifest.json oraz /world/systems/sol-001.json.

## Dokumentacja plikowa
- Dokumentacja danych jest obok plikow jako .md (np. art/asset-manifest.json.md, world/systems/sol-001.json.md).

## Czego NIE robi
- Nie zawiera kodu TypeScript wykonywanego w runtime.
- Nie przechowuje konfiguracji bundlera.
