# src/physics

## Cel folderu
Pomocnicza warstwa matematyczna dla operacji w przestrzeni 2D.

## Co zawiera
- `Vector2.ts`: klasa `Vec2` z podstawowymi operacjami na wektorach (`add`, `sub`, `scale`, `length`, `normalize`, `dot`, `distanceTo`) oraz stala `Vec2.ZERO`.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: moze byc importowane przez warstwy fizyki, swiata i renderowania.

## Jak uzywac
```ts
import { Vec2 } from './Vector2';

const a = new Vec2(3, 4);
const b = new Vec2(1, 2);
const dist = a.distanceTo(b);
```

## Czego NIE robi
- Nie implementuje wykrywania kolizji ani integracji fizycznej.
- Nie zarzadza encjami gry.
