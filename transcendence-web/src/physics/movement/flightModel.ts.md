## Cel pliku
Plik implementuje czysta funkcje aktualizacji modelu lotu statku na podstawie wejscia i konfiguracji. Zawiera tez pomocnicze obliczenie przyspieszenia Flight Assist.

## Co eksportuje
- Interfejs FlightUpdateResult
- Funkcja computeFlightUpdate(...): FlightUpdateResult

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Math, Number.
- Wewnetrzne: src/types/common.ts, src/systems/flight/flightConfig.ts, src/world/entities/PlayerShipEntity.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { computeFlightUpdate } from '@physics/movement/flightModel';
import { DEFAULT_FLIGHT_CONFIG } from '@systems/flight/flightConfig';

const result = computeFlightUpdate(
  { x: 0, y: 0 },
  0,
  {
    rotateLeft: false,
    rotateRight: false,
    rearThruster: true,
    frontThruster: false,
  },
  DEFAULT_FLIGHT_CONFIG,
  true,
  1 / 60,
);
```

## Czego NIE robi
- Nie aktualizuje bezposrednio instancji encji.
- Nie integruje kolizji ani ograniczen obszaru mapy.
