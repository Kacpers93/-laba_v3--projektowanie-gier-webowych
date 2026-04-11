## Cel pliku
Plik implementuje klase Vec2 z podstawowymi operacjami wektorowymi 2D. Zapewnia metody arytmetyczne i pomocnicze obliczenia geometrii.

## Co eksportuje
- Klasa Vec2

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Math API.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import { Vec2 } from './Vector2';

const a = new Vec2(1, 2);
const b = new Vec2(3, 4);
const sum = a.add(b);
```

## Czego NIE robi
- Nie zawiera macierzy ani transformacji 3D.
- Nie implementuje detekcji kolizji.
