# Siec zaleznosci i strategia refaktoru (feature-first)

## Cel
- Uporzadkowac architekture tak, aby edycja jednej funkcjonalnosci (np. paralaksy) odbywala sie w jednym module, bez szukania zmian po wielu katalogach.
- Ograniczyc rozrost pliku AppShell przez przeniesienie logiki skladania komponentow do modulow funkcjonalnych.
- Zdefiniowac twarde zasady przenoszenia plikow, importow i miejsc "zakotwiczonych" (plikow, ktore musza pozostac w konkretnych lokalizacjach).

## Parametry wejsciowe/wyjsciowe

### Wejscie
- Aktualny kod w `transcendence-web/src` z architektura warstwowa (engine, presentation, systems, ui, world).
- Aktualne aliasy w `transcendence-web/tsconfig.json` i `transcendence-web/vite.config.ts`.
- Aktualny composition root w `transcendence-web/src/app/AppShell.ts`.
- Statyczne zasoby i manifesty w `transcendence-web/public`.

### Wyjscie
- Docelowa struktura feature-first z modulami odpowiedzialnymi za pojedyncze obszary domeny.
- Jasna odpowiedz: tak, edycja paralaksy ma byc wykonywana glownie w jednym folderze modulu `parallax`.
- Centralny mechanizm skladania modulow w `app/composition`, zamiast dopisywania wszystkiego do AppShell.
- Zasady importowania przez aliasy i publiczne API moduow (barrel files), nie przez glebokie sciezki.
- Lista plikow zakotwiczonych, ktorych nie przenosimy.

## Problem obecny
- Jedna funkcjonalnosc jest rozproszona: implementacja warstwy, konfiguracja, assety i wiring sa w kilku miejscach.
- `AppShell.ts` laczy wiele odpowiedzialnosci: bootstrap, scene wiring, input, hud/menu, dev tools, konfiguracje warstw.
- Zmiana polozenia pliku powoduje serie zmian importow, bo importy odnosza sie do lokalizacji implementacji, a nie do stabilnego API moduow.

## Docelowy model architektury

### Zasada glowna
- Kazda funkcjonalnosc ma jeden modul domenowy w `src/features/<nazwa-funkcjonalnosci>/`.
- Modul posiada publiczne wejscie `index.ts` i nie ujawnia struktury wewnetrznej.
- Pozostale czesci aplikacji importuja tylko z `@features/<modul>` albo z jego kontraktu.

### Docelowa struktura katalogow
```text
transcendence-web/src/
  app/
    composition/
      FeatureModule.ts
      registerFeatureModules.ts
      RuntimeContext.ts
    AppShell.ts
  features/
    parallax/
      index.ts
      module.ts
      config.ts
      contracts.ts
      scene/
        ParallaxLayer.ts
        parallax-presets.ts
      assets/
        parallaxManifest.ts
      README.md
    background/
      ...
    flight/
      ...
    hud/
      ...
```

### Interfejs modulu
- Kazdy modul implementuje jeden kontrakt:
  - `id` - identyfikator modulu.
  - `setup(context)` - rejestracja warstw, systemow, listenerow.
  - `start()` - uruchomienie runtime.
  - `dispose()` - zwolnienie zasobow.
- `AppShell.ts` nie zna detali paralaksy; wywoluje tylko rejestracje modulow.

## Przeplyw dla paralaksy (po refaktorze)

### Miejsce edycji
- Edycja logiki i konfiguracji paralaksy: `transcendence-web/src/features/parallax/**`.
- Wyjatek: nowe tekstury nadal trafiaja do `transcendence-web/public/art/**` i manifestu.

### Odpowiedzialnosc plikow modulu parallax
- `module.ts` - integracja paralaksy z runtime i scene.
- `config.ts` - parametry warstw, depth, predkosci.
- `scene/ParallaxLayer.ts` - implementacja renderowania.
- `scene/parallax-presets.ts` - zestawy subwarstw.
- `assets/parallaxManifest.ts` - mapowanie kluczy assetow paralaksy.
- `README.md` - opis granic modulu i plikow zakotwiczonych.

## AppShell po odchudzeniu
- `AppShell.ts` utrzymuje tylko:
  - tworzenie root canvas i warstw DOM,
  - tworzenie runtime context,
  - wywolanie `registerFeatureModules(context)`,
  - start/stop petli gry.
- Konfiguracje typu `ACTIVE_PARALLAX_SUBLAYERS` i budowanie warstw sceny nie sa trzymane bezposrednio w AppShell.

## Importy niezalezne od lokalizacji plikow

### Zasady
- Importy miedzy modulami wyłącznie przez publiczne API:
  - `@features/parallax`
  - `@features/flight`
- Zakaz importow typu `@features/parallax/scene/internalFile` poza modulem parallax.
- Kazdy modul ma `index.ts` jako jedyne publiczne wejscie.

### Wymagane aliasy
- Dodac alias `@features/* -> ./src/features/*` w:
  - `transcendence-web/tsconfig.json`
  - `transcendence-web/vite.config.ts`

## Pliki zakotwiczone (nie przenosic)
- `transcendence-web/index.html` - punkt wejscia bundlera i aplikacji.
- `transcendence-web/vite.config.ts` - konfiguracja bundlera i aliasow.
- `transcendence-web/tsconfig.json` - mapowanie aliasow TypeScript.
- `transcendence-web/public/**` - statyczne zasoby serwowane przez Vite po sciezkach URL.
- `transcendence-web/public/art/asset-manifest.json` - zrodlo mapowania assetow.

## Proces migracji (kolejnosc)
1. Utworzyc `src/features/parallax` i przeniesc tam pliki paralaksy.
2. Dodac `module.ts`, `index.ts`, `contracts.ts`, `README.md`.
3. Dodac `@features/*` do Vite i TS.
4. Wydzielic z `AppShell.ts` wiring paralaksy do modulu.
5. Podlaczyc modul przez `registerFeatureModules.ts`.
6. Powtorzyc ten sam wzorzec dla kolejnych funkcjonalnosci (background, hud, flight, audio).

## Definicja gotowosci (DoD)
- Zmiana parametrow paralaksy wymaga edycji tylko w `src/features/parallax/**` oraz ewentualnie w `public/art/asset-manifest.json` przy zmianie assetow.
- `AppShell.ts` nie zawiera bezposredniej konfiguracji subwarstw paralaksy.
- Wszystkie importy zewnatrz modulu parallax prowadza przez `@features/parallax`.
- Modul ma `README.md` z sekcja "Pliki zakotwiczone i powody".

## Zachowanie brzegowe
- Przeniesienie pliku bez aktualizacji exportu w `index.ts` powoduje blad importu na etapie build.
- Zmiana sciezek assetow bez aktualizacji `asset-manifest.json` powoduje placeholdery lub bledy ladowania.
- Pozostawienie logiki feature w `AppShell.ts` po migracji powoduje duplikacje inicjalizacji i regresje runtime.
- Cykl zaleznosci miedzy modulami (A importuje B i B importuje A) blokuje uruchomienie; zaleznosci miedzy modulami prowadzi sie przez kontrakty i eventy.
- Importowanie plikow wewnetrznych innego modulu omija jego API i lamie hermetyzacje; takie importy sa niedozwolone.

## Regula dokumentacyjna dla kazdego modulu
- Kazdy modul `src/features/<nazwa>` ma obowiazkowo `README.md` o strukturze:
  - Cel modulu
  - Parametry wejsciowe/wyjsciowe
  - Zachowanie brzegowe
  - Pliki zakotwiczone i uzasadnienie
  - Publiczne API (`index.ts`)
