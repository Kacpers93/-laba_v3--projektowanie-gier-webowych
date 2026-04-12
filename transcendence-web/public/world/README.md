# public/world

## Cel folderu
Statyczne dane seeda swiata wykorzystywane podczas ladowania systemu.

## Co zawiera
- systems/: pliki JSON definiujace pojedyncze systemy.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: brak.
- Wewnetrzne: odczyt przez src/world/seed/SystemSeedLoader.ts.

## Jak uzywac
Pliki systemow sa pobierane przez URL /world/systems/<id>.json.

## Dokumentacja plikowa
- Dokumentacja danych jest obok plikow JSON jako .md.

## Czego NIE robi
- Nie zawiera kodu TypeScript.
- Nie waliduje danych samodzielnie.
