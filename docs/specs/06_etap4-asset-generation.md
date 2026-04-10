# Etap 4 — Spec: powtarzalne generowanie assetów PNG

## Cel

Ten dokument jest gotową instrukcją dla innego agenta. Ma opisać dokładnie, jak wygenerować nowe assety PNG dla Etapu 4 w sposób powtarzalny, bez zgadywania stylu, nazw ani rozmiarów.

Jeśli chcesz użyć innego agenta, przekaż mu ten plik jako jedyne źródło prawdy dla generacji assetów.

Ten dokument opisuje wyłącznie paczkę zamykającą Etap 4.
Zakres paczki jest zamknięty do 8 assetów i nie obejmuje rozszerzeń po Etapie 4.

## Co ma powstać

Minimalny zestaw 8 plików PNG w `transcendence-web/public/art/`:

- `ships/scout-mk1.png`
- `ships/freighter-standard.png`
- `stations/trading-outpost.png`
- `stations/mining-platform.png`
- `gates/stargate-standard.png`
- `gates/jumpgate-ancient.png`
- `celestial/planet-terran.png`
- `celestial/asteroid-rocky.png`

Do tego manifest:

- `public/art/asset-manifest.json`

## Dane wejściowe, których agent ma się trzymać

### Kategorie

- `ship`
- `station`
- `gate`
- `celestial`

### Mapowanie folderów

- `ship` → `ships/`
- `station` → `stations/`
- `gate` → `gates/`
- `celestial` → `celestial/`

### Nazewnictwo plików

- tylko lowercase
- separator tylko `-`
- rozszerzenie tylko `.png`
- nazwa ma być zgodna z `assetId`

### Rozmiary PNG

- `scout-mk1.png` 64x40
- `freighter-standard.png` 96x64
- `trading-outpost.png` 128x128
- `mining-platform.png` 112x96
- `stargate-standard.png` 80x96
- `jumpgate-ancient.png` 96x112
- `planet-terran.png` 256x256
- `asteroid-rocky.png` 48x48

## Styl wizualny

Assety mają być spójne z kosmiczną paralaksą gry:

- tło przezroczyste
- czytelny kontur i mocna sylwetka
- umiarkowana paleta, bez neonowej przesady
- statek ma być zwrócony w prawo przy rotacji `0`
- obiekty statyczne mogą ignorować orientację frontalną
- obiekty mają być wycentrowane w ramce

## Manifest

Manifest ma zawierać dokładnie 8 wpisów i musi spełniać te reguły:

- `schemaVersion: 1`
- `updatedAt` w formacie ISO 8601
- `assetId` unikalne globalnie
- `url` zaczyna się od `/art/` i kończy na `.png`
- `frameWidth`, `frameHeight`, `worldSize.width`, `worldSize.height`, `cullRadius` są większe od zera
- `version` jest liczbą całkowitą >= 1
- `tags` opcjonalne, ale jeśli są, muszą być tablicą stringów

### Wpisy manifestu

1. `scout-mk1`
2. `freighter-standard`
3. `trading-outpost`
4. `mining-platform`
5. `stargate-standard`
6. `jumpgate-ancient`
7. `planet-terran`
8. `asteroid-rocky`

## Fallback i tolerancje

Jeśli agent nie potrafi wygenerować pliku w zadanym stylu, ma zrobić najprostszy możliwy poprawny PNG z przezroczystym tłem i wyraźnym kształtem, zamiast wymyślać nowe assety lub zmieniać listę plików.

Jeśli rozmiar techniczny obrazu różni się od deklarowanego o więcej niż 2 px, należy to traktować jako błąd i poprawić plik, nie manifest.

## Czego agent nie może zmieniać

- nie wolno zmieniać nazw plików
- nie wolno dodawać nowych assetów
- nie wolno usuwać assetów z listy
- nie wolno zmieniać kategorii
- nie wolno zmieniać struktury folderów
- nie wolno dodawać atlasów, sprite sheetów ani animacji frame-by-frame

## Gotowy prompt dla innego agenta

Użyj tego tekstu, jeśli chcesz przekazać zadanie innemu agentowi bez dodatkowego tłumaczenia:

```text
Wygeneruj 8 plików PNG dla Etapu 4 zgodnie z poniższą specyfikacją. Trzymaj się dokładnie nazw, rozmiarów, kategorii i stylu. Nie dodawaj żadnych nowych assetów. Wszystkie obrazy mają mieć przezroczyste tło, spójną kosmiczną paletę i być wycentrowane w ramce.

Pliki:
- ships/scout-mk1.png 64x40
- ships/freighter-standard.png 96x64
- stations/trading-outpost.png 128x128
- stations/mining-platform.png 112x96
- gates/stargate-standard.png 80x96
- gates/jumpgate-ancient.png 96x112
- celestial/planet-terran.png 256x256
- celestial/asteroid-rocky.png 48x48

Manifest:
- schemaVersion: 1
- updatedAt: ISO 8601
- 8 wpisów, po jednym na asset
- url tylko pod /art/...
- version >= 1

Styl:
- transparent background
- consistent sci-fi palette
- readable silhouette
- ships face right at rotation 0
- objects centered in frame

Jeśli nie możesz wygenerować dokładnego stylu, wygeneruj prostszy poprawny PNG zamiast zmieniać specyfikację.
```

## Kryterium akceptacji

Zadanie jest gotowe, jeśli:

- wszystkie 8 plików istnieje w odpowiednich folderach
- manifest zawiera 8 poprawnych wpisów
- nazwy i rozmiary są zgodne ze specyfikacją
- PNG mają przezroczyste tło
- nie ma dodatkowych assetów

## Powiązane dokumenty

- `10_etap4-specyfikacja.md`
- `04_presentation-assets.md`
- `05_plan-prac.md`