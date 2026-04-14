# src/physics/movement

## Cel folderu
Implementacje modeli ruchu wykorzystywanych przez encje runtime. Obecnie zawiera model lotu statku gracza.

## Co zawiera
- flightModel.ts: funkcja computeFlightUpdate i typ wyniku FlightUpdateResult.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Math.
- Wewnetrzne: src/systems/flight/flightConfig.ts, src/world/entities/PlayerShipEntity.ts, src/types/common.ts.

## Jak uzywac
```ts
import { computeFlightUpdate } from '@physics/movement/flightModel';
```

## Dokumentacja plikowa
- flightModel.ts.md

## Czego NIE robi
- Nie aktualizuje pozycji encji bezposrednio w managerze.
- Nie implementuje solvera kolizji.
