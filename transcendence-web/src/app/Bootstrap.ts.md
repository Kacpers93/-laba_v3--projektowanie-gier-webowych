## Cel pliku
Plik uruchamia start aplikacji przez utworzenie AppShell i wywolanie metody start. Zawiera prosty fallback UI dla bledow uruchomienia.

## Co eksportuje
- Funkcja asynchroniczna bootstrap(): Promise<void>

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: DOM API (document, HTMLElement).
- Wewnetrzne: src/app/AppShell.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { bootstrap } from './Bootstrap.ts';

void bootstrap();
```

## Czego NIE robi
- Nie zarzadza petla gry bezposrednio.
- Nie konfiguruje rendererow, wejscia ani warstw sceny samodzielnie.
