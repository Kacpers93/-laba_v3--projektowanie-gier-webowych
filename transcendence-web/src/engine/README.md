# src/engine

## Cel folderu
Podstawowe elementy silnika uruchamianego w przegladarce: dzwiek, input, petla czasu i renderer.

## Co zawiera
- `audio/`: manager audio i kanaly glosnosci.
- `input/`: obsluga wejscia gry i UI oraz trybow inputu.
- `loop/`: stala petla aktualizacji i renderu.
- `renderer/`: canvas renderer oraz kamera.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: `AudioContext`, `HTMLAudioElement`, `requestAnimationFrame`, Canvas 2D.
- Wewnetrzne: typy z `src/types` i wykorzystanie przez `src/app`.

## Jak uzywac
Silnik jest skladany przez `AppShell`, np. utworzenie `GameLoop` i `Renderer` w konstruktorze shella.

## Dokumentacja plikowa
- Opisy plikow sa obok kodu jako `*.md` (np. `audio/AudioManager.ts.md`, `loop/GameLoop.ts.md`).
- Przy dodawaniu nowego modulu silnika dodaj odpowiadajacy plik dokumentacji w tym samym folderze.

## Czego NIE robi
- Nie zawiera warstw prezentacji sceny (to `src/presentation`).
- Nie odpowiada za strukture HTML aplikacji.
