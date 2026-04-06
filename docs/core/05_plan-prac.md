# Plan prac

## Zasada
Pracujemy warstwami produkcyjnymi, nie listą przypadkowych feature'ów.

## Status implementacyjny
- Etap 1: wdrożony.
- Etap 2: wdrożony.
- Etap 3: wdrożony.
- Etapy 3.5–9: planowane.

## Etap 1
`app/`, `engine/`, `physics/`, `types/`
- runtime,
- loop,
- input mode,
- renderer,
- kamera,
- audio,
- podstawowe typy.

Kryteria zamknięcia Etapu 1: `06_etap1-specyfikacja.md`, sekcja 6.

## Etap 2
`presentation/scene/`, `presentation/cache/`, `styles/`
- warstwy renderu,
- tła,
- paralaksa,
- cache,
- porządek rysowania.

Kryteria zamknięcia Etapu 2: `07_etap2-specyfikacja.md`, sekcja 5.

## Etap 3
`entities/base/`, `presentation/renderables/`, `presentation/profiles/`
- wspólne kontrakty bytów świata,
- wspólne kontrakty wizualne.

Kryteria zamknięcia Etapu 3: `08_etap3-specyfikacja.md`, sekcja 11.

## Etap 3.5
`dev/`, `presentation/cache/` (refaktor), `presentation/scene/WorldLayer.ts` (rozszerzenie)
- Dev Overlay Panel (zwijany panel debug po prawej stronie z metrykami runtime),
- rozszerzalny system sekcji i metryk (`registerSection`, `registerMetric`),
- toggle test bytu (checkbox + `localStorage` zamiast hardkodowanej stałej),
- skrót klawiaturowy 6 do pokazywania/ukrywania panelu,
- refaktor `OffscreenCache.ts` na fasadę + `EntityCacheBudget` + `EntityLruIndex` + `cacheTypes`,
- publiczne gettery metryk render w `WorldLayer` (`renderableCount`, `lastVisibleCount`, `lastCulledCount`).

Kryteria zamknięcia Etapu 3.5: `09_etap3.5-specyfikacja.md`, sekcja 14.

## Etap 4
`public/art/ships/`, `stations/`, `gates/`, `celestial/`
- przygotowanie pierwszych spójnych assetów.

## Etap 5
`entities/ships/`, `stations/`, `gates/`, `world/`
- osadzenie bytów świata w systemach i scenie.

## Etap 6
`systems/reactor/`, `ship-mass/`, `flight/`, `weapons/`, `shields/`, `capture/`
- wdrożenie podstawowych mechanik gameplayowych.

## Etap 7
`ui/`
- HUD,
- menu,
- dock,
- salvage,
- inventory,
- ship status.

## Etap 8
`items/`, `missions/`, `factions/`, `world/spawn/`
- rozbudowa contentu i tabel spawnu.

## Etap 9
`presentation/variants/`, `presentation/effects/`, `public/audio/`
- warianty wizualne,
- efekty,
- pełne audio.

## Kryterium zamknięcia etapu
Każdy etap zamyka:
- foldery,
- kontrakty,
- minimalne typy,
- podstawowy przepływ danych,
- brak tymczasowego mieszania odpowiedzialności.