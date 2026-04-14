## Cel pliku
Plik definiuje encje statku gracza jako rozszerzenie WorldEntity z logika lotu i Flight Assist. Aktualizuje rotacje, predkosc, przyspieszenie i pozycje na podstawie wejscia oraz konfiguracji lotu.

## Co eksportuje
- Klasa PlayerShipEntity
- Interfejs FlightInput

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Math, console.
- Wewnetrzne: src/types/common.ts, src/entities/base/EntityCategory.ts, src/physics/movement/flightModel.ts, src/systems/flight/flightConfig.ts, src/world/seed/seedTypes.ts, src/world/entities/WorldEntity.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { PlayerShipEntity } from '@world/entities';
import { DEFAULT_FLIGHT_CONFIG } from '@systems/flight/flightConfig';

const ship = new PlayerShipEntity({
  id: 'player-ship-01',
  category: 'ship',
  seedType: 'player-ship',
  position: { x: 0, y: 0 },
  width: 72,
  height: 48,
  computedHeight: 11,
  isStatic: false,
  profileId: 'freighter-standard',
  flightConfig: DEFAULT_FLIGHT_CONFIG,
});

ship.updateFlight(1 / 60, {
  rotateLeft: false,
  rotateRight: true,
  rearThruster: true,
  frontThruster: false,
});
```

## Czego NIE robi
- Nie obsluguje mapowania klawiszy na akcje lotu.
- Nie rejestruje encji w EntityManager ani nie renderuje jej samodzielnie.
