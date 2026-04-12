# src/presentation/profiles

## Cel folderu
Kontrakty i rejestr profili wizualnych uzywanych do tworzenia renderables.

## Co zawiera
- VisualProfile.ts: typy profilu i zrodla grafiki.
- VisualProfileRegistry.ts: rejestr profili oparty o Map.
- index.ts: eksport zbiorczy.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Canvas 2D types.
- Wewnetrzne: entities/base.

## Jak uzywac
```ts
import { VisualProfileRegistry } from '@presentation/profiles';
```

## Dokumentacja plikowa
- VisualProfile.ts.md
- VisualProfileRegistry.ts.md
- index.ts.md

## Czego NIE robi
- Nie laduje obrazow z sieci.
- Nie renderuje encji bezposrednio.
