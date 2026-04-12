# public/world/systems

## Cel folderu
Pliki definicji systemow gwiezdnych w formacie JSON.

## Co zawiera
- sol-001.json: seed systemu startowego ladowany przez AppShell i SystemSeedLoader.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: src/world/seed/SystemSeedLoader.ts, src/world/seed/validateSystemSeed.ts.

## Jak uzywac
```ts
await systemSeedLoader.loadSystem('/world/systems/sol-001.json');
```

## Dokumentacja plikowa
- sol-001.json.md

## Czego NIE robi
- Nie przechowuje kodu wykonawczego.
- Nie zawiera manifestu assetow art.
