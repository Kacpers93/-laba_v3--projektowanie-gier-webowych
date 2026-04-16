# src/world/entities

## Cel folderu
Definicje encji swiata tworzonych z seeda systemu.

## Co zawiera
- index.ts: eksport zbiorczy modulu encji swiata.
- WorldEntity.ts: klasa encji runtime z danymi seedType, computedHeight, profileId i bounding box.
- PlayerShipEntity.ts: klasa encji statku gracza z logika lotu i Auto-Stop HOLD.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: entities/base, physics, world/seed.

## Jak uzywac
```ts
import { PlayerShipEntity, WorldEntity } from '@world/entities';
```

## Dokumentacja plikowa
- index.ts.md
- WorldEntity.ts.md
- PlayerShipEntity.ts.md

## Czego NIE robi
- Nie waliduje seeda.
- Nie rejestruje encji w managerze.
