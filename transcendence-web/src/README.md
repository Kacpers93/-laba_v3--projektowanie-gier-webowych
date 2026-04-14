# src

## Cel folderu
Glowny katalog kodu zrodlowego aplikacji. Grupuje bootstrap, shell aplikacji, warstwy renderowania, wejscie, typy i style.

## Co zawiera
- `main.ts`: import stylow i start bootstrapu.
- `app/`: uruchamianie aplikacji i skladanie komponentow runtime.
- `engine/`: podstawowe elementy silnika (audio, input, petla, renderer).
- `physics/`: narzedzia matematyczne 2D (wektory i operacje pomocnicze).
- `presentation/`: warstwy wizualne i cache renderowania.
- `styles/`: style globalne i warstwowe.
- `types/`: wspolne typy i kontrakty.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: API przegladarki (`document`, `window`, canvas).
- Wewnetrzne: aliasy projektowe `@`, `@engine`, `@types`.

## Jak uzywac
Minimalny przeplyw:
1. `main.ts` laduje style.
2. `main.ts` wywoluje `bootstrap()`.
3. `bootstrap()` tworzy `AppShell` i uruchamia petle.

## Dokumentacja plikowa
- Dokumentacja plikow jest trzymana bezposrednio obok kodu jako pliki z sufiksem `.md`.
- Dla nowych plikow kodu nalezy dodac odpowiadajacy plik `<nazwa_pliku_kodu>.md` w tym samym folderze.

## Czego NIE robi
- Nie jest folderem produkcyjnych assetow poza kodem i CSS.
- Nie zawiera konfiguracji bundlera (to jest w katalogu glownym).
