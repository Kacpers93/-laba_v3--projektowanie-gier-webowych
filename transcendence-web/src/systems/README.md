# src/systems

## Cel folderu
Warstwa systemow domenowych aplikacji. Zawiera moduly odpowiedzialne za logike sterowania i konfiguracje konkretnych mechanik.

## Co zawiera
- flight/: mapowanie akcji lotu oraz konfiguracja modelu lotu.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: wykorzystywane przez src/engine/input, src/physics/movement i src/world/entities.

## Jak uzywac
Importuj konkretne systemy przez sciezki aliasowe, np. @systems/flight/FlightActions.

## Dokumentacja plikowa
- Dokumentacja plikow jest trzymana obok kodu jako pliki .md, np. flight/FlightActions.ts.md i flight/flightConfig.ts.md.

## Czego NIE robi
- Nie zawiera warstw renderowania ani kodu bootstrap aplikacji.
- Nie przechowuje danych statycznych seeda swiata.
