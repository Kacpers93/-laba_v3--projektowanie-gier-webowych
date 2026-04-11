# src/presentation

## Cel folderu
Warstwa prezentacji sceny: cache offscreen oraz kolekcja warstw renderowanych w kolejnosci.

## Co zawiera
- `cache/`: cache offscreen canvas.
- `scene/`: renderer sceny, interfejs warstwy i konkretne warstwy (tlo, parallax, world, effects, debug).

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: `OffscreenCanvas`, Canvas 2D API.
- Wewnetrzne: kamera z `src/engine/renderer`, typy i configi warstw.

## Jak uzywac
`AppShell` tworzy `SceneRenderer`, dodaje warstwy i wywoluje `update`/`render` w petli gry.

## Dokumentacja plikowa
- Dokumentacja plikow presentation jest trzymana lokalnie przy kodzie jako `*.md`.
- Dotyczy to podfolderow `assets`, `cache`, `profiles`, `renderables`, `scene`.

## Czego NIE robi
- Nie odpowiada za bootstrap aplikacji i DOM shell.
- Nie zawiera logiki wejscia uzytkownika.
