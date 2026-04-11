## Cel pliku
Plik implementuje rejestr profili wizualnych oparty o Map. Zapewnia dodawanie, pobieranie i sprawdzanie istnienia profili po profileId.

## Co eksportuje
- Klasa VisualProfileRegistry

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Map.
- Wewnetrzne: src/presentation/profiles/VisualProfile.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { VisualProfileRegistry } from './VisualProfileRegistry';

const registry = new VisualProfileRegistry();
registry.register(profile);
const found = registry.get(profile.profileId);
```

## Czego NIE robi
- Nie laduje profili z plikow.
- Nie aktualizuje istniejacego wpisu po tym samym id.
