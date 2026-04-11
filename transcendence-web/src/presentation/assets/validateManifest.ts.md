## Cel pliku
Plik waliduje surowe dane manifestu assetow i zwraca bezpieczna kopie tylko poprawnych wpisow. Loguje bledy krytyczne i ostrzezenia dla odrzuconych rekordow.

## Co eksportuje
- Funkcja validateManifest(raw): AssetManifest | null

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Date.parse, Set, console.
- Wewnetrzne: src/presentation/assets/assetTypes.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { validateManifest } from './validateManifest';

const validated = validateManifest(rawJson);
if (!validated) {
  // obsluga bledu manifestu
}
```

## Czego NIE robi
- Nie pobiera danych z sieci.
- Nie rejestruje profili ani nie preloaduje obrazow.
