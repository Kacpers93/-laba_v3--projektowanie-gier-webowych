# Plan prac

## Zasada
Pracujemy warstwami produkcyjnymi, nie listą przypadkowych feature'ów.

## Status implementacyjny
- Etap 1: wdrożony.
- Etap 2: wdrożony.
- Etap 3: wdrożony.
- Etap 3.5: wdrożony.
- Etap 4: wdrożony.
- Etap 5: wdrożony.
- Etap 5.5: wdrożony.
- Etap 6: wdrożony.
- Etapy 7–11: planowane.

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

Kryteria zamknięcia Etapu 4: `10_etap4-specyfikacja.md`, sekcja 11.

## Etap 5
`entities/ships/`, `stations/`, `gates/`, `world/`
- osadzenie bytów świata w systemach i scenie,
- seed systemu startowego (format i loader runtime),
- statyczne pasy asteroid jako element seeda systemu startowego.

Kryteria zamknięcia Etapu 5: `11_etap5-specyfikacja.md`, sekcja 12

## Etap 5.5
`engine/input/`, `systems/flight/`, `dev/` (rozszerzenie), `engine/renderer/`, `presentation/scene/`, `presentation/renderables/`
- wdrożenie Flight Model (fizyka Newtonowska, thrustery, obrót, Auto-Stop HOLD),
- wstępny model przemieszczania gracza do testowania,
- dev mode toggle — przełącza tryb kamery (flight follow ↔ free camera), bez wyłączania Flight Model,
- publiczne gettery statystyk lotu w ship (velocity, acceleration, heading),
- rozszerzenie 5.5.1: adaptacyjna skala renderu i dirty sort (`WorldLayer`),
- rozszerzenie 5.5.2: anti-shimmer dla obiektów statycznych (`pixel-snap-static`),
- rozszerzenie 5.5.3: optymalizacja paralaksy dla dużego viewportu (cap tekstur, `densityMultiplier`),
- metryki płynności runtime w Dev Overlay (`fps`, `frame ms`).

Kryteria zamknięcia Etapu 5.5: `13_etap5.5-specyfikacja.md`, sekcje 12, 15, 16 i 17.

## Etap 6
`ui/`
- HUD,
- menu,
- dock,
- salvage,
- inventory,
- ship status.

Kryteria zamknięcia Etapu 6: edycja UI zintegrowana z systemem gry i gotowa do feedback'ów z testów.

## Etap 7
`systems/reactor/`, `ship-mass/`, `flight/`, `weapons/`, `shields/`, `capture/`
- wdrożenie podstawowych mechanik gameplayowych.

## Etap 8
`world/`, `systems/gates/`, `systems/spawn/`
- systemy i sektory,
- wrota i przejścia między systemami,
- widoczność jednostek przez bramy,
- spawnowanie z limitami,
- respawn zniszczonych asteroid po upłynięciu czasu,
- reputacja sektora i gating modulów.

- Wstępny model Etapu 8: `docs/specs/05_etap7-world-architecture.md`

## Etap 9
`items/`, `missions/`, `factions/`, `world/spawn/`
- rozbudowa contentu i tabel spawnu.

## Etap 10
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