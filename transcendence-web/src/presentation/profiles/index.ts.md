## Cel pliku
Plik agreguje eksporty modulow profili wizualnych. Umozliwia centralny import kontraktow i rejestru profili.

## Co eksportuje
- Typy VisualProfile, VisualSource, ProceduralDrawFn
- Klasa VisualProfileRegistry

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/presentation/profiles/VisualProfile.ts, src/presentation/profiles/VisualProfileRegistry.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { VisualProfileRegistry } from '@presentation/profiles';
import type { VisualProfile } from '@presentation/profiles';
```

## Czego NIE robi
- Nie przechowuje danych runtime profili.
- Nie wykonuje walidacji importowanych profili.
