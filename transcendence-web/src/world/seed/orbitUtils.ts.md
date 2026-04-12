## Cel pliku
Plik dostarcza funkcje obliczania pozycji obiektu na orbicie na podstawie pozycji parenta, promienia i fazy. Uzywany jest przy pozycjonowaniu obiektow systemu.

## Co eksportuje
- Funkcja computeOrbitPosition(parentPosition, orbitRadius, orbitPhaseDeg): Vector2

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Math.
- Wewnetrzne: src/types/common.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { computeOrbitPosition } from './orbitUtils';

const pos = computeOrbitPosition({ x: 0, y: 0 }, 100, 90);
```

## Czego NIE robi
- Nie waliduje zakresow danych wejsciowych.
- Nie rozwiazuje zaleznosci parent-child w drzewie orbit.
