# Presentation i assets

## Zakres
Ten dokument opisuje warstwę wizualną obiektów świata oraz strukturę zasobów.

## Zasada podstawowa
Każdy ważny obiekt świata ma dwie strony:
- logiczną w `entities/`,
- wizualną w `presentation/`.

## Struktura `presentation/`
- `scene/` — zaimplementowane w Etapie 2
- `cache/` — zaimplementowane w Etapie 2
- `renderables/` — planowane (Etap 3)
- `profiles/` — planowane (Etap 3)
- `variants/` — planowane (Etap 9)
- `effects/` — planowane (Etap 9)

## Struktura `public/art/`
- `ships/` (planowane)
- `stations/` (planowane)
- `gates/` (planowane)
- `celestial/` (planowane)
- `effects/` (planowane)
- `ui/` (planowane)
- `atlases/` (planowane)

## Struktura `public/audio/`
- `music/` (planowane)
- `sfx/` (planowane)
- `ui/` (planowane)

## Reguły wizualne
- Statki, stacje, wrota, planety i gwiazdy mają osobne profile wizualne.
- Wariant frakcji i wariant uszkodzeń nie zmieniają logiki bytu.
- Obiekty rzadko zmienne mogą korzystać z prerenderu i cache offscreen.
- Tło i elementy statyczne oddzielamy od warstw dynamicznych.

## Antywzorce
- Nie trzymamy wyglądu statku wyłącznie w `entities/`.
- Nie mieszamy efektów wizualnych z logiką systemów gameplayowych.
- Nie używamy przypadkowych luźnych assetów bez kategorii i atlasów.

Kontrakty scene i cache Etapu 2: `07_etap2-specyfikacja.md`.