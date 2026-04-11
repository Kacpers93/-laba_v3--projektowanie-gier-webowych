# src/entities/base

## Cel folderu
Bazowe kontrakty i implementacje encji: interfejsy typow encji, manager rejestru oraz klasa bazowa.

## Co zawiera
- index.ts: eksport zbiorczy API base.
- BaseEntity.ts: abstrakcyjna implementacja wspolnych pol encji.
- EntityManager.ts: rejestr aktywnych encji.
- EntityCategory.ts, GameEntity.ts, DestroyableEntity.ts, FactionOwned.ts: kontrakty typow.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: typy z src/types i src/physics.

## Jak uzywac
Importuj z @entities/base i buduj encje dziedziczace po BaseEntity.

## Dokumentacja plikowa
- Kazdy plik kodu ma lokalny opis .md w tym samym folderze (np. BaseEntity.ts.md).

## Czego NIE robi
- Nie zawiera runtime AI ani mechanik walki.
- Nie zarzadza renderowaniem encji.
