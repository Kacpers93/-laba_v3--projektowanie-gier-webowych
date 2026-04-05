# Architektura repo

## Cel
Ten dokument jest jedynym źródłem prawdy o strukturze repozytorium.
Opisuje podział odpowiedzialności między warstwy i wskazuje, gdzie kończy się logika, a gdzie zaczyna prezentacja.

## Struktura główna

```txt
src/
├── app/
├── engine/
├── physics/
├── world/
├── systems/
├── entities/
├── items/
├── missions/
├── factions/
├── presentation/
├── ui/
├── types/
└── styles/

public/
├── art/
├── audio/
└── fonts/

docs/
├── core/
    ├── architecture.md
    ├── 01_runtime-engine.md
    ├── 02_gameplay-domeny.md
    ├── 03_ui-dom.md
    ├── 04_presentation-assets.md
    └── 05_plan-prac.md
```

## Reguły stałe
- `entities/` przechowuje logikę bytów świata.
- `presentation/` przechowuje wygląd, render, profile wizualne i efekty.
- `ui/` przechowuje interfejs DOM: HUD, ekrany, menu i nawigację.
- `world/` przechowuje strukturę świata, systemy gwiezdne, sektory i spawn.
- `systems/` przechowuje logikę mechanik gameplayowych.
- `styles/` przechowuje wspólne style globalne, a style specyficzne dla ekranów mogą siedzieć przy modułach UI.
- `public/art/` i `public/audio/` przechowują surowe zasoby oraz atlasy wynikowe.

## Reguły wykonawcze
- Żaden ważny obiekt świata nie istnieje tylko jako dane bez reprezentacji wizualnej.
- Żadna logika gameplayowa nie siedzi w `presentation/`.
- Żaden komponent DOM nie zawiera logiki gry.
- Nie dublujemy struktury repo w kilku dokumentach.

## Dokumenty powiązane
- Runtime i silnik: `01_runtime-engine.md`
- Domeny gameplayowe: `02_gameplay-domeny.md`
- UI DOM: `03_ui-dom.md`
- Prezentacja i assety: `04_presentation-assets.md`
- Plan prac: `05_plan-prac.md`