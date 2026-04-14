# src/systems/flight

## Cel folderu
Definicje konfiguracji i mapowania akcji zwiazanych z lotem. Folder dostarcza stale i typy uzywane przez wejscie i model ruchu.

## Co zawiera
- FlightActions.ts: mapa FLIGHT_KEY_MAP i typ FlightActionId.
- flightConfig.ts: kontrakt FlightConfig i stala DEFAULT_FLIGHT_CONFIG.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: wykorzystywane przez src/engine/input/GameInput.ts, src/physics/movement/flightModel.ts i src/world/entities/PlayerShipEntity.ts.

## Jak uzywac
```ts
import { FLIGHT_KEY_MAP } from '@systems/flight/FlightActions';
import { DEFAULT_FLIGHT_CONFIG } from '@systems/flight/flightConfig';
```

## Dokumentacja plikowa
- FlightActions.ts.md
- flightConfig.ts.md

## Czego NIE robi
- Nie obsluguje zdarzen klawiatury bezposrednio.
- Nie aktualizuje stanu encji lotu.
