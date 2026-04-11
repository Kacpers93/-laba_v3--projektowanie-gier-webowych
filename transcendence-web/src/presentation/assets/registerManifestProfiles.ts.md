## Cel pliku
Plik mapuje wpisy manifestu assetow na profile wizualne i rejestruje je w VisualProfileRegistry. Pomija duplikaty profileId z ostrzezeniem.

## Co eksportuje
- Funkcja registerManifestProfiles(manifest, registry): void

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/presentation/profiles/VisualProfile.ts, src/presentation/profiles/VisualProfileRegistry.ts, src/presentation/assets/assetTypes.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { registerManifestProfiles } from './registerManifestProfiles';

registerManifestProfiles(manifest, visualProfileRegistry);
```

## Czego NIE robi
- Nie laduje obrazow z URL.
- Nie waliduje manifestu (zaklada wynik po validateManifest).
