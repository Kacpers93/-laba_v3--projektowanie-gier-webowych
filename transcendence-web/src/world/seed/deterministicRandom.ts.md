## Cel pliku
Plik implementuje deterministyczny generator liczb pseudolosowych oparty o algorytm mulberry32. Umozliwia powtarzalna generacje ukladow asteroid i offsetow.

## Co eksportuje
- Funkcja createDeterministicRng(seed): () => number

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Math.imul i operatory bitowe.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import { createDeterministicRng } from './deterministicRandom';

const rng = createDeterministicRng(1234);
const value = rng();
```

## Czego NIE robi
- Nie zapewnia kryptograficznej losowosci.
- Nie przechowuje stanu generatora poza domknieciem zwroconej funkcji.
