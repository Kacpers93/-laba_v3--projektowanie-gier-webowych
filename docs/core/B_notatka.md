# B — Wstępny zarys Etapu 5

## Cel
- Wdrożenie podstawowego szkieletu świata dla jednego systemu: osadzenie bytów (słońce, planety, księżyce, wrota, wraki stacji, stacje, asteroidy, kontenery, wraki statków, statki NPC, statek gracza) w sposób oparty na danych.
- Zastąpienie bytu testowego rzeczywistym ładowaniem seeda systemu i rejestracją bytów w `EntityManager` oraz `WorldLayer`.

## Parametry wejściowe
- `systemSeed`: lista definicji obiektów (id, type, profileId, orbitRadius [px], parentId?, orbitPhase?).
- Visual profiles i assety (Etap 4).
- Runtime: `EntityManager`, `RenderableFactory`, `WorldLayer`.

## Parametry wyjściowe
- Zainstancjonowane encje zarejestrowane w `EntityManager` i powiązane renderowalnymi obiektami w `WorldLayer`.
- Utrwalony `systemSeed` z wyznaczonymi fazami orbit (deterministyczne pozycje).
- Metryki deweloperskie: liczba bytów, liczba renderowalnych, rozkład po kategoriach.

## Zachowanie brzegowe
- Brak kolizji między obiektami; nachodzenie jest dozwolone.
- Kwestia z-order: obiekty z tym samym height otrzymują deterministyczne, minimalne przesunięcie porządku, aby uniknąć flicker.
- Orbity mierzone w pikselach.
- Obiekty orbitują względem parentId (pozycja = parent.position + offset na orbicie).
- orbitPhase dla obiektów statycznych jest losowana podczas tworzenia seeda, a następnie zapisywana i traktowana jako dane stałe.
- Brak profilu wizualnego: fallback proceduralny + warning.
- Duplikat id: odrzucenie wpisu + error.
- Obiekty poza granicą systemu:
  - statyczne: pominięcie z warningiem,
  - dynamiczne: utworzenie jako nieaktywne.
- Kolizje projektyli z obiektami są poza zakresem Etapu 5.

## Typy obiektów i numeracja porządkowa
- Bazowa numeracja porządku rysowania (1..11):
  - 1 — słońce (sun)
  - 2 — planety (planet)
  - 3 — księżyce (moon)
  - 4 — wrota (gate)
  - 5 — wraki stacji (station-wreck)
  - 6 — stacje (station)
  - 7 — asteroidy (asteroid)
  - 8 — kontenery (container)
  - 9 — wraki statków (ship-wreck)
  - 10 — statki NPC (npc-ship)
  - 11 — statek gracza (player-ship)
- Dla wielu instancji tej samej kategorii dopuszczalna część ułamkowa (np. 2.1, 2.2, 2.3).
- Validator seeda wymusza player-ship >= 11 (lub nadpisuje na 11 przy wczytaniu).

## Granica systemu
- `informationalBoundaryRadius` (px): promień od centrum systemu używany w celach informacyjnych — UI może go rysować jako granicę pomocniczą.
- `maxBoundaryRadius` (px): maksymalna odległość od centrum, powyżej której obiekty są traktowane jako poza granicą systemu (obecnie tylko informacyjne; w przyszłości można dodać mechanikę zdarzeń przy przekroczeniu).
- `center`: punkt referencyjny systemu (domyślnie { x: 0, y: 0 }). Wszystkie `orbitRadius` liczone są względem tego punktu albo względem `parentId` (jeśli obiekt orbituje wokół innego obiektu).
- Zachowanie: na tym etapie granice są informacyjne. Przy weryfikacji seeda obiekty statyczne poza `maxBoundaryRadius` należy odrzucić z ostrzeżeniem; obiekty dynamiczne można utworzyć jako nieaktywne.

## Proponowany format pliku seeda systemu
Cel: łatwy do edycji, czytelny format (JSON lub YAML). Pliki umieścić w `public/world/systems/<systemId>.json` (dostępne runtime) i opcjonalnie w `docs/world/seeds/<systemId>.yaml` jako źródło autorskie.

Przykład (JSON):

{
  "systemId": "sol-001",
  "name": "Sol",
  "center": { "x": 0, "y": 0 },
  "informationalBoundaryRadius": 1200,
  "maxBoundaryRadius": 2500,
  "objects": [
    {
      "id": "sun-1",
      "type": "star",
      "profileId": "star-yellow-large",
      "orbitRadius": 0,
      "orbitPhase": 0,
      "orbitAround": null,
      "static": true,
      "height": 1
    },
    {
      "id": "planet-1",
      "type": "planet",
      "profileId": "planet-terra",
      "orbitRadius": 300,
      "orbitPhase": 123.4, // stopnie 0..360, ustalone przy generacji
      "orbitAround": "sun-1",
      "static": true,
      "height": 2.1
    },
    {
      "id": "planet-2",
      "type": "planet",
      "profileId": "planet-barren",
      "orbitRadius": 420,
      "orbitPhase": 210,
      "orbitAround": "sun-1",
      "static": true,
      "height": 2.2
    },
    {
      "id": "moon-1",
      "type": "moon",
      "profileId": "moon-small",
      "orbitRadius": 50,
      "orbitPhase": 30,
      "orbitAround": "planet-1",
      "static": true,
      "height": 3.1
    },
    {
      "id": "station-1",
      "type": "station",
      "profileId": "trading-outpost",
      "orbitRadius": 520,
      "orbitPhase": 200,
      "orbitAround": "sun-1",
      "static": true,
      "height": 6.1
    },
    {
      "id": "container-1",
      "type": "container",
      "profileId": "cargo-container",
      "orbitRadius": 850,
      "orbitPhase": 215,
      "orbitAround": "sun-1",
      "static": true,
      "height": 8.1
    },
    {
      "id": "wreck-ship-1",
      "type": "wreck",
      "profileId": "ship-wreck-small",
      "orbitRadius": 900,
      "orbitPhase": 220,
      "orbitAround": "sun-1",
      "static": true,
      "height": 9.1
    },
    {
      "id": "npc-ship-1",
      "type": "npc-ship",
      "profileId": "npc-scout",
      "orbitRadius": 1000,
      "orbitPhase": 250,
      "orbitAround": "sun-1",
      "static": false,
      "height": 10.1
    },
    {
      "id": "player-ship",
      "type": "player-ship",
      "profileId": "player-falcon",
      "orbitRadius": 120,
      "orbitPhase": 180,
      "orbitAround": "sun-1",
      "static": false,
      "height": 11
    }
  ],
  "asteroidGroups": [
    {
      "id": "belt-1",
      "orbitRadius": 800,
      "orbitPhase": 210,
      "length": 1200,
      "width": 180,
      "density": 0.02,
      "height": 7
    }
  ]
}
  /* Asteroidy nie są listowane pojedynczo w pliku seeda — patrz sekcja `asteroidGroups` */
  Uwaga: plik seeda NIE powinien zawierać pojedynczych wpisów typu `asteroid`. Zamiast tego definiujemy parametry grupy (`length`, `width`, `density`, opcjonalnie `count`) a runtime rozwinie je do indywidualnych encji asteroidalnych podczas ładowania systemu. Indywidualne asteroidy dostaną wygenerowane fractional `height` (np. `7.1`, `7.2`), lub można przypisać `height` bazowe na poziomie grupy i dodać indeks.

Pole `orbitPhase`: wartość w stopniach (0–360). Przy generacji systemu wybieramy losowy `orbitPhase` dla każdego obiektu statycznego i zapisujemy go — po odczycie pozycja jest deterministyczna.

Uwagi do pól:
- `orbitAround`: `id` obiektu, wokół którego orbituje (null = centrum systemu).
- `static`: czy obiekt jest nieruchomy (statyczny) — używane do oznaczania obiektów, które nie mają update() runtime.
- `height`: wartość porządku rysowania (większa => rysowane 'nad' innymi). Przy remisach stosować deterministyczne przesunięcie (np. inkrementacja na podstawie porządku w pliku), aby uniknąć flicker.

Grupy asteroid `asteroidGroups` reprezentować jako zgrupowany, lekko elipsoidalny pas: `orbitRadius` = środek pasa, `length` = długość łuku/pasa w px, `width` = grubość, `density` = średnia liczba asteroid na jednostkę długości.

Asteroidy — pasy i porządek zagnieżdżony
- Typ bazowy asteroidy to `7`. Każdy pas otrzymuje indeks `beltIndex` (np. 1, 2, ...). Pas ma reprezentację porządkową `7.<beltIndex>`.
- Indywidualne asteroidy generowane z grupy dostają zagnieżdżony identyfikator porządkowy `7.<beltIndex>.<asteroidIndex>` (gdzie `asteroidIndex` jest numerem w obrębie pasa).
- Praktyczne pola seedowe:
  - `beltIndex`: number — indeks pasa (opcjonalny, ale zalecany dla kontroli porządku),
  - `count`: number — opcjonalna liczba asteroid do wygenerowania (nadpisuje `density`),
  - `seed`: number — opcjonalny seed losowy, by generacja była deterministyczna.
- Obliczanie wartości sortującej do renderu (`computedHeight`):

  computedHeight = 7 + (beltIndex / 100) + (asteroidIndex / 1000)

  (np. pas `beltIndex=1` → baza 7.01; trzecia asteroida → 7.013).

- Dzięki temu można mieć wiele pasów blisko siebie; każdy pas ma odrębną część dziesiętną, a asteroidy w pasie mają drobniejszą separację.
- Rekomendacja: w seedzie definiować `beltIndex` i `count`/`density`; loader wygeneruje indywidualne encje asteroidalne i przypisze `computedHeight` zgodnie z powyższą metodą.

---- 
Ten szkic jest wstępny — szczegóły implementacyjne (API seeda, format manifestu, implementacja grup asteroid) rozwinąć w następnych krokach.

## Dev Overlay — ręczne dodawanie i testowanie
- Rozszerzyć panel deweloperski o prosty formularz do: wybierz `type`, `profileId` (autocomplete z `VisualProfileRegistry`), `orbitRadius`, `orbitPhase` (deg), `orbitAround` (select z istniejących obiektów), `height` i `spawn`.
- `Spawn` powinien natychmiast:
	- utworzyć encję i `Renderable`,
	- zarejestrować ją w `EntityManager`,
	- dodać do `WorldLayer`.
Uwaga zakresu:
- Etap 5: narzędzie pomocnicze do pracy na realnych obiektach w jednym systemie startowym.
- Etap 5.5: doprecyzowanie docelowego API świata, wielosystemowości i kontraktów architektury.

----
To uzupełnienie zachowuje dotychczasowe założenia (brak kolizji między obiektami, orbitPhase trwale zapisywane). Następne kroki: stworzyć prosty parser seeda (runtime loader), implementować walidację i narzędzie deweloperskie do eksportu/importu seeda.


