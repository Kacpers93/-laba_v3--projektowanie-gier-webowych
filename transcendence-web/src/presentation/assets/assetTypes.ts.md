## Cel pliku
Plik definiuje strukture TypeScript manifestu assetow i pojedynczego wpisu assetu. Ujednolica kontrakt danych wymaganych do rejestracji profili.

## Co eksportuje
- Interfejs AssetManifestEntry
- Interfejs AssetManifest

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import type { AssetManifest } from './assetTypes';

const manifest: AssetManifest = {
  schemaVersion: 1,
  updatedAt: '2026-04-11T12:00:00Z',
  assets: [],
};
```

## Czego NIE robi
- Nie zawiera walidacji runtime danych.
- Nie implementuje ladowania pliku manifestu.
