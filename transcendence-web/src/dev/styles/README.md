# src/dev/styles

## Cel folderu
Style CSS dla narzedzi deweloperskich uruchamianych w trybie DEV.

## Co zawiera
- dev-overlay.css: style panelu dev overlay (kontener, sekcje, metryki i kontrolki).

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CSS.
- Wewnetrzne: klasy uzywane przez src/dev/DevOverlayPanel.ts i src/dev/DevSection.ts; ladowane dynamicznie z src/main.ts.

## Jak uzywac
Plik ladowany jest dynamicznie w DEV przez import @dev/styles/dev-overlay.css.

## Dokumentacja plikowa
- dev-overlay.css.md

## Czego NIE robi
- Nie tworzy elementow panelu w DOM.
- Nie przechowuje stanu metryk.
