# Presentation i assets

## Zakres
Ten dokument opisuje warstwę wizualną obiektów świata oraz strukturę zasobów.

## Zasada podstawowa
Każdy ważny obiekt świata ma dwie strony:
- logiczną w `entities/`,
- wizualną w `presentation/`.

## Struktura `presentation/`
- `scene/`
- `renderables/`
- `profiles/`
- `variants/`
- `effects/`
- `cache/`

## Struktura `public/art/`
- `ships/`
- `stations/`
- `gates/`
- `celestial/`
- `effects/`
- `ui/`
- `atlases/`

## Struktura `public/audio/`
- `music/`
- `sfx/`
- `ui/`

## Reguły wizualne
- Statki, stacje, wrota, planety i gwiazdy mają osobne profile wizualne.
- Wariant frakcji i wariant uszkodzeń nie zmieniają logiki bytu.
- Obiekty rzadko zmienne mogą korzystać z prerenderu i cache offscreen.
- Tło i elementy statyczne oddzielamy od warstw dynamicznych.

## Antywzorce
- Nie trzymamy wyglądu statku wyłącznie w `entities/`.
- Nie mieszamy efektów wizualnych z logiką systemów gameplayowych.
- Nie używamy przypadkowych luźnych assetów bez kategorii i atlasów.