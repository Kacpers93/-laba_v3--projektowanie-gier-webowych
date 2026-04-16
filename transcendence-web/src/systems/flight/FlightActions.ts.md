## Cel pliku
Plik definiuje minimalna mape akcji lotu na klawisze klawiatury dla runtime. Udostepnia tez typ identyfikatorow akcji wyprowadzony z tej mapy.

Uwaga: klucz `toggle-flight-assist` jest nazwa historyczna. W runtime sluzy jako przycisk HOLD dla Auto-Stop.

## Co eksportuje
- Stala FLIGHT_KEY_MAP
- Typ FlightActionId

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import { FLIGHT_KEY_MAP } from '@systems/flight/FlightActions';

const toggleAssistKey = FLIGHT_KEY_MAP['toggle-flight-assist'];
```

## Czego NIE robi
- Nie obsluguje zdarzen klawiatury.
- Nie implementuje systemu rebindowania akcji.
