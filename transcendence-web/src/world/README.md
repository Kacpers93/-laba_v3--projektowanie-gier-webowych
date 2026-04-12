# src/world

## Cel folderu
Moduly odpowiedzialne za dane i ladowanie systemu swiata. Zawiera definicje encji seedowych oraz pipeline seeda.

## Co zawiera
- entities/: encja runtime tworzona z danych seeda.
- seed/: typy seeda, walidacja, loader systemu, obliczenia orbit i rozwijanie grup asteroid.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: fetch, performance, Math.
- Wewnetrzne: entities/base, presentation/profiles, presentation/renderables, presentation/scene, types.

## Jak uzywac
Importuj API przez @world/seed i @world/entities, np. w AppShell podczas ladowania systemu.

## Dokumentacja plikowa
- Dokumentacja plikow jest obok kodu jako pliki .md (np. seed/SystemSeedLoader.ts.md, entities/WorldEntity.ts.md).

## Czego NIE robi
- Nie zawiera petli gry ani wejscia uzytkownika.
- Nie implementuje warstw renderowania sceny.
