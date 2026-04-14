## Cel pliku
Plik definiuje kontrakt konfiguracji modelu lotu oraz domyslny zestaw parametrow lotu. Parametry obejmuja ciag, obrot, limit predkosci i ustawienia Flight Assist.

## Co eksportuje
- Interfejs FlightConfig
- Stala DEFAULT_FLIGHT_CONFIG

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import { DEFAULT_FLIGHT_CONFIG } from '@systems/flight/flightConfig';

const maxSpeed = DEFAULT_FLIGHT_CONFIG.maxSpeed;
```

## Czego NIE robi
- Nie oblicza aktualizacji predkosci i rotacji.
- Nie odczytuje konfiguracji z plikow zewnetrznych.
