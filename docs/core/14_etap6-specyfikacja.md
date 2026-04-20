# Transcendence UI - Etap 6

## Cel

Celem etapu 6 jest zbudowanie wspólnego systemu menu i HUD dla wielu obiektów gry, z zachowaniem jednego modelu danych menu oraz osobnych wariantów widoku zależnych od kontekstu obiektu.

UI ma obsługiwać te same mechanizmy na statku, stacji, wraku i innych obiektach świata, ale każdy obiekt ma pobierać tylko własny zestaw dostępnych pozycji z wspólnego katalogu elementów.

W tym etapie nie zamykamy jeszcze wszystkich paneli informacyjnych. Część pól pozostaje otwarta do późniejszego podpinania danych runtime.

Zakres implementacji etapu 6 obejmuje od razu profile menu dla: statku gracza, stacji, wraku i kontenera, na jednym wspólnym silniku menu.

## Parametry wejściowe

### 1. Kontekst obiektu
Każdy ekran menu otrzymuje kontekst aktywnego obiektu.

Minimalny zestaw danych:
- `objectType` - typ obiektu, na przykład statek, stacja, wrak, punkt misji.
- `objectState` - stan obiektu, na przykład `active`, `disabled`, `destroyed`, `docked`, `looted`.
- `menuProfile` - identyfikator profilu menu wyznaczany przez `objectType` i `objectState`.
- `availableNodes` - lista dostępnych pozycji menu wygenerowana przez runtime payload.
- `sceneLabel` - nazwa obiektu lub lokacji widoczna w nagłówku.
- `sceneDescription` - opis obiektu widoczny w panelu kontekstowym.

### 2. Wspólny katalog pozycji
Menu nie jest definiowane osobno dla każdego obiektu od zera. Obiekt wskazuje elementy z katalogu wspólnego.

Katalog może zawierać między innymi:
- inventory,
- modules,
- commodities,
- dock,
- missions,
- salvage,
- ship status,
- services,
- trade,
- help,
- exit.

### 3. Dane HUD
HUD pobiera dane z osobnych źródeł niż menu.

Minimalny zestaw danych:
- nazwa statku lub obiektu,
- kredyty,
- przestrzeń ładunkowa,
- wybrany cel,
- radar lokalny,
- informacje o reaktorze w trybie otwartym.

### 4. Model źródeł danych UI
Model danych etapu 6 używa podejścia: registry + runtime payload jako główny mechanizm, encje i seedy jako źródło wejścia.

Zasady:
- encje i seedy dostarczają dane wejściowe (`objectType`, `objectState`, identyfikatory profili),
- registry przechowuje katalog bazowy pozycji oraz profile obiektów,
- runtime payload składa finalne drzewo menu i finalny model HUD dla aktywnego kontekstu,
- UI renderuje payload i nie duplikuje logiki domenowej.

### 5. Parametry dokowania (`E`)
Dokowanie jest akcją wejścia do menu obiektowego obiektu dokowalnego.

Minimalny zestaw danych:
- `dockable: boolean` - flaga, czy obiekt przyjmuje dokowanie,
- `dockInteractionDistancePx: number` - próg interakcji dokowania liczony w pikselach,
- `playerRenderBounds` - pole renderu statku gracza,
- `targetRenderBounds` - pole renderu obiektu dokowalnego.

Konfiguracja runtime etapu 6:
- `dockInteractionDistancePx = 20`.

## Wyjście

### 1. Menu obiektowe
System generuje drzewo menu dla bieżącego obiektu.

Wynik ma spełniać te warunki:
- menu jest wspólne strukturalnie,
- obiekt widzi tylko dozwolone gałęzie,
- podmenu są nawigowane poziomami wielopoziomowo,
- elementy mogą być dziedziczone lub współdzielone między obiektami,
- jedna pozycja może występować w wielu profilach bez duplikowania definicji,
- nagłówek menu zawsze pokazuje `sceneLabel` aktywnego kontekstu (statek, stacja, wrak, kontener lub statek gracza w wolnej przestrzeni),
- panel wyboru menu jest zawsze renderowany po prawej stronie ekranu,
- lewa część ekranu pozostaje przestrzenią na zawartość kontekstową (na przykład sklep, moduły, opis elementu).

### 2. HUD
System renderuje stałe elementy HUD oraz elementy zależne od kontekstu.

Wynik ma spełniać te warunki:
- górny pasek pokazuje podstawową tożsamość sceny,
- lewy dolny panel pokazuje zaznaczony cel,
- prawy dolny panel pokazuje status statku,
- mini radar pokazuje lokalny wycinek świata w niskiej rozdzielczości,
- środek ekranu pozostaje czytelny dla samej sceny.

## Zachowanie

### 1. Ogólna struktura menu
Menu ma być definiowane jako katalog wspólnych elementów, a nie jako zestaw odrębnych, zamkniętych ekranów.

Zasady:
- każdy obiekt pobiera menu z katalogu na podstawie profilu,
- główny mechanizm budowy menu to registry + runtime payload,
- wejście do dowolnego menu obiektowego pauzuje symulację świata w tle,
- wyjście z menu obiektowego wznawia symulację świata,
- jeden element może być używany w wielu miejscach,
- obiekt może nadpisywać etykietę, opis lub dostępność pozycji,
- drzewo menu może zawierać podmenu i elementy liściowe,
- podmenu zachowują spójny wygląd i zachowanie we wszystkich obiektach.

### 1.1. Profil menu obiektu
Każdy obiekt, który może otwierać menu, musi mieć przypisany profil menu już na etapie tworzenia encji.

Zasady:
- profil menu określa zbiór pozycji głównych oraz ich podmenu,
- obiekt nie buduje własnego drzewa menu od zera,
- brak danych dla pozycji oznacza brak renderu tej pozycji,
- brak danych nie usuwa definicji z katalogu bazowego,
- profil może być różny dla tego samego obiektu w zależności od stanu, na przykład `active`, `disabled`, `destroyed`, `docked`, `looted`.

### 1.2. Stany obiektu i menu po zmianie stanu
Jeżeli obiekt zmienia stan fizyczny lub logiczny, jego menu przełącza się na profil przypisany do nowego stanu.

Zasady:
- stacja handlowa przed zniszczeniem i po zniszczeniu może mieć różne profile menu,
- wrak statku zachowuje akcje zgodne ze swoim stanem, nawet jeśli jego ładownia jest pusta,
- kontener, wrak i statek gracza mogą mieć osobne reguły dostępności dla tych samych pozycji katalogu bazowego,
- element menu pozostaje widoczny tylko wtedy, gdy profil obiektu nadal go wystawia,
- jeżeli obiekt ma zachować akcję po utracie zawartości, ta akcja musi wynikać z profilu stanu, a nie z danych zawartości.

### 1.3. Reguły startowe `objectState` i `menuProfile` (encje z seeda)
W etapie 6 obowiązuje minimalny, deterministyczny model przejścia stanu.

Reguły:
- źródło danych wejściowych: encja z seeda (`objectType`, flagi stanu, `dockable`),
- priorytet wyliczania `objectState`: `destroyed` > `disabled` > `docked` > `looted` > `active`,
- `menuProfile` wyznacza się przez parę (`objectType`, `objectState`),
- brak dopasowania mapowania oznacza użycie profilu domyślnego `objectType.default`.

Mapowanie startowe:
- `playerShip.active` -> `playerShip.default`,
- `playerShip.docked` -> `playerShip.docked`,
- `station.active` -> `station.default`,
- `station.destroyed` -> `station.destroyed`,
- `wreck.active` -> `wreck.default`,
- `wreck.looted` -> `wreck.looted`,
- `container.active` -> `container.default`,
- `container.looted` -> `container.looted`.

### 2. Podział odpowiedzialności między obiektami
Obiekt nie definiuje całego interfejsu samodzielnie.

Przykłady:
- statek salvage może korzystać z pozycji modules, inventory, salvage i repair,
- stacja może korzystać z pozycji commodities, dock, missions, services,
- statek gracza może korzystać z ship status, modules, inventory i weapons,
- wrak statku może zachować salvage, inventory i dump cargo po opróżnieniu ładowni,
- wrak stacji może zachować salvage, container access i transfer,
- kontener może wystawiać tylko inventory, loot i transfer,
- część pozycji może być współdzielona, jeśli semantyka jest zgodna z obiektem.

Minimalny zakres wdrożenia etapu 6:
- profil statku gracza,
- profil stacji,
- profil wraku,
- profil kontenera.

### 3. Inventory
Inventory nie jest elementem globalnego UI.

Zasady:
- inventory trafia pod menu ship status,
- inventory jest częścią struktury przypisanej do statku lub innego obiektu, który faktycznie posiada ładunek,
- inventory może być udostępniane jako podmenu, a nie jako osobny główny ekran,
- menu globalne nie pokazuje inventory bez kontekstu obiektu.

### 3.1. Inventory i pusty stan obiektu
Jeżeli obiekt traci ładunek, inventory nie znika automatycznie, jeśli profil stanu nadal przewiduje tę gałąź.

Zasady:
- pusty kontener pokazuje stan pusty zamiast usuwać gałąź inventory,
- wrak z opróżnioną ładownią nadal może prezentować akcje transferu, wyrzucania lub przeglądu,
- element inventory znika dopiero wtedy, gdy profil obiektu nie przypisuje go do danego stanu,
- brak zawartości nie jest równoznaczny z brakiem dostępu do menu.

### 4. Reaktor
Panel reaktora pozostaje otwarty i nie jest zamykany na sztywno w tym etapie.

Zasady:
- reaktor ma być traktowany jako sekcja rozszerzalna,
- obecnie nie przypisuje się mu finalnych danych runtime,
- różne typy reaktorów będą miały później własne zestawy parametrów,
- statek będzie używał reaktora w sposób specyficzny dla swojego typu,
- UI reaktora ma zachować miejsce na przyszłe informacje bez wymuszania finalnego modelu danych.

### 5. Lewy dolny panel celu
Lewy dolny panel przedstawia zaznaczoną jednostkę.

Zasady:
- panel pokazuje podstawowe informacje o wybranym obiekcie,
- zakres, tarcze i pancerz pozostają widoczne,
- nazwa celu ma być wyraźnie eksponowana.

### 6. Mini radar
Mini radar ma prezentować lokalny wycinek świata w low-res, z zachowaniem charakteru oryginalnej gry.

Zasady:
- radar pokazuje obiekty w pobliżu,
- radar uwzględnia planety, NPC, jednostki i inne aktywne obiekty,
- radar działa jako widok skrócony, a nie pełna mapa systemowa,
- radar filtruje kontakty przed renderem,
- czytelność ma być ważniejsza niż szczegółowość,
- przedstawienie ma przypominać niskorozdzielczy podgląd pola walki lub sektora,
- low-res oznacza maksymalnie uproszczone renderowanie kontaktów przy zachowaniu zgodności obiektów widocznych dla gracza,
- tryb low-res ma być projektowany pod minimalny wpływ na FPS,
- statki, kontenery i pociski (rakiety, lasery, strzaly) sa renderowane jako pojedyncze piksele,
- asteroidy sa renderowane jako znaczniki posrednie miedzy pikselem a duzym obiektem,
- duze obiekty (gwiazdy, planety, stacje) zajmuja wiecej miejsca niz zwykle kontakty,
- mapowanie kolorow relacji jest stale: `friendly` - niebieski, `neutral` - bialy, `hostile` - czerwony, `unknown` - szary,
- nowe statusy relacji wymagaja jawnego dopisania koloru w konfiguracji.

### 7. Menu hierarchiczne i nawigacja
Menu ma obsługiwać wejście poziomami w głąb drzewa, bez rozwijania gałęzi inline.

Zasady:
- nawigacja klawiaturą: strzałki góra i dół poruszają wybór po liście,
- `Enter` otwiera podmenu albo aktywuje pozycję liściową,
- `Esc` wraca do poziomu wyżej,
- `Esc` na poziomie bazowym zamyka menu i przywraca tryb gry,
- `Esc` w trybie gry, gdy nie ma aktywnego menu obiektowego, otwiera menu gry (zapis, keybind, ustawienia),
- `B` w trybie gry, gdy nie ma aktywnego menu obiektowego, otwiera menu obiektowe statku gracza,
- `E` w trybie gry, gdy gracz jest w zasięgu obiektu dokowalnego, wykonuje dokowanie i otwiera menu obiektowe tego obiektu,
- warunek zasięgu dokowania: odległość między polami renderu (`playerRenderBounds`, `targetRenderBounds`) nie przekracza `dockInteractionDistancePx`,
- w etapie 6 próg dokowania jest jawny i ustawiony na `20 px`,
- wejście do pozycji z dziećmi otwiera podmenu jako nowy poziom,
- powrót do poziomu wyżej jest jawny i dostępny także jako pozycja `Esc` możliwa do zatwierdzenia `Enter`,
- struktura breadcrumb pokazuje aktualną ścieżkę,
- pozycje liściowe wykonują akcję albo otwierają panel kontekstowy,
- podmenu dla obiektu może być częściowo wspólne z innymi obiektami,
- listy o dużej liczbie pozycji wspierają przewijanie,
- menu wspiera pełną obsługę myszą (klik pozycji oraz klik przycisku `Esc`),
- każda pozycja menu ma przypisany skrót literowy widoczny przed nazwą,
- resolver skrótów działa tak: pierwsza litera nazwy, potem kolejne litery nazwy przy kolizji, a gdy brak wolnych liter w nazwie - pierwsza wolna litera alfabetycznie.

Drzewo startowe `menu gry` (otwierane przez `Esc` poza menu obiektowym):
- `Resume` - zamknięcie menu gry i powrót do symulacji,
- `Save Game` - zapis stanu gry do aktywnego slotu,
- `Keybindings` - otwarcie ekranu mapowania klawiszy,
- `Settings` - otwarcie panelu ustawień (audio/video/gameplay),
- `Exit to Main Menu` - powrót do menu głównego aplikacji.

### 8. Struktura katalogu bazowego
Katalog bazowy ma być opisany tak, aby można było łatwo dopinać nowe elementy do drzewa bez przepisywania istniejących definicji.

Zasady:
- każda pozycja katalogu ma stabilny identyfikator,
- jedna definicja może być współużywana przez wiele profili,
- lokalna etykieta obiektu nadpisuje etykietę bazową bez tworzenia duplikatu,
- katalog bazowy powinien rozdzielać definicję funkcjonalną od danych widoku,
- elementy menu mają być grupowane w warstwach: wspólne, typ obiektu, stan obiektu, nadpisanie lokalne.

## Zachowanie brzegowe

- Jeżeli obiekt nie ma przypisanego profilu menu, system ma użyć profilu domyślnego z minimalnym zestawem pozycji.
- Jeżeli pozycja wspólna nie jest dostępna dla obiektu, nie jest renderowana w jego drzewie menu.
- Jeżeli menu zawiera puste podmenu, system ma pokazać stan bez akcji zamiast łamać strukturę.
- Jeżeli panel reaktora nie ma danych runtime, ma pozostać widoczny jako otwarta sekcja bez sztucznych wartości końcowych.
- Jeżeli cel nie jest zaznaczony, panel lewy dolny pokazuje stan pusty z zachowaniem layoutu.
- Jeżeli radar nie ma obiektów w zasięgu, wyświetla pusty sektor zamiast wymyślonych kontaktów.
- Jeżeli dane panelu HUD są niedostępne, panel renderuje `N/A` w miejscach wartości i zachowuje geometrię layoutu.
- Jeżeli obiekt dziedziczy pozycję z katalogu wspólnego, ale wymaga innej etykiety, etykieta lokalna nadpisuje etykietę bazową bez duplikowania definicji.
- Jeżeli obiekt przechodzi w stan z własnym profilem menu, system przełącza go bez przepisywania drzewa po stronie runtime.
- Jeżeli wrak, kontener albo statek nie ma zawartości, gałąź menu może pozostać widoczna jako pusta, jeśli wynika to z profilu stanu.
- Jeżeli obiekt po zniszczeniu ma zachować część interakcji, stan `destroyed` musi mieć osobny profil menu.
- Jeżeli wystąpi kolizja skrótów literowych menu, resolver skrótów musi zastosować kolejne litery nazwy, a następnie pierwszą wolną literę alfabetycznie.
- Jeżeli użytkownik naciśnie `Esc` na poziomie bazowym menu, system zamyka menu i wraca do trybu gry.
- Jeżeli użytkownik naciśnie `Esc` poza menu obiektowym, system otwiera menu gry.
- Jeżeli użytkownik naciśnie `B` poza menu obiektowym, system otwiera menu obiektowe statku gracza.
- Jeżeli użytkownik naciśnie `E` poza menu obiektowym i obiekt ma `dockable = false`, system nie otwiera żadnego menu.
- Jeżeli użytkownik naciśnie `E` poza menu obiektowym i nie ma w zasięgu obiektu dokowalnego, system nie otwiera żadnego menu.

## Reguły modelu menu

### Katalog bazowy
Katalog bazowy zawiera definicje funkcjonalne, na przykład:
- identyfikator,
- etykieta,
- opis,
- hotkey bazowy,
- akcja,
- dzieci,
- warunki dostępności.

Zasady:
- hotkey bazowy może być nadpisany przez resolver kolizji skrótów na etapie budowy runtime payloadu.

### Profil obiektu
Profil obiektu określa:
- które elementy katalogu bazowego są dostępne,
- która ścieżka menu jest domyślnie aktywna po wejściu,
- które etykiety są nadpisane,
- które sekcje widoku są aktywne.

### Źródła danych i składanie runtime payloadu
Składanie danych UI działa w trzech warstwach:
- warstwa wejścia: encje i seedy,
- warstwa definicji: registry katalogu i profili,
- warstwa renderu: runtime payload przekazywany do UI.

Reguły:
- encje i seedy nie przechowują gotowych drzew renderowych,
- registry przechowuje definicje współdzielone,
- runtime payload powstaje per aktywny kontekst obiektu,
- UI nie buduje logiki domenowej i renderuje tylko payload.

### Dziedziczenie
Dziedziczenie działa na poziomie definicji, a nie na poziomie pojedynczego renderu.

Zasady:
- element bazowy może być użyty przez wiele obiektów,
- obiekt może rozszerzyć element o własne dziecko,
- obiekt może ukryć element bez usuwania go z katalogu,
- modyfikacje dotyczą profilu, nie kopii danych.

## Ustalenia startowe (minimalne, odblokowujące etap 6)
Poniższe wartości są wiążące dla implementacji etapu 6 i mogą być rozszerzone w kolejnych etapach bez łamania kontraktu.

1. Źródło runtime dla `target` i relacji:
- źródło `target`: aktywny wybór z systemu targetowania gracza,
- źródło `relation`: runtime resolver relacji frakcji gracza do frakcji celu,
- mapowanie relacji: `friendly`, `neutral`, `hostile`, `unknown`,
- brak danych frakcyjnych celu oznacza `unknown`.

2. Jawna konfiguracja runtime radaru:
- `radar.baseRangeUnits = 1200`,
- `radar.rangeModifier = 1.0`,
- `radar.minRangeUnits = 300`,
- `radar.rangeUnits = max(radar.minRangeUnits, radar.baseRangeUnits * radar.rangeModifier)`,
- `radar.noiseSeed` pochodzi z deterministycznego seeda systemu.

3. Kryterium `nieodświeżony` dla panelu HUD:
- każdy panel przechowuje `lastDataTick`,
- panel jest oznaczony jako `nieodswiezony`, gdy brakuje nowych danych przez 2 kolejne ticki,
- gdy istnieje ostatni poprawny stan, panel renderuje ten stan z flagą `nieodswiezony`,
- gdy brak ostatniego poprawnego stanu, panel renderuje `N/A`.

Status etapu 6:
- punkt dokowania (`E`, próg `20 px`) jest doprecyzowany,
- źródło i mapowanie `objectState/menuProfile` jest doprecyzowane,
- drzewo `menu gry` pod `Esc` jest doprecyzowane,
- źródło `target/relation` jest doprecyzowane,
- konfiguracja startowa radaru jest doprecyzowana,
- kryterium `nieodswiezony` HUD jest doprecyzowane.

## Kryterium zgodności

Wdrożenie etapu 6 jest zgodne z tym dokumentem, jeżeli:
- inventory nie funkcjonuje jako globalna sekcja UI,
- inventory jest dostępne przez ship status lub inny obiektowy profil menu,
- menu działa na wspólnym katalogu elementów,
- obiekty mają jawnie przypisane profile menu dla swoich stanów,
- stacja, wrak i statek używają różnych profili tego samego systemu,
- reaktor pozostaje otwarty jako sekcja na przyszłe dane,
- mini radar pokazuje lokalny wycinek świata w low-res.

## Doprecyzowanie etapu 6 - HUD glowny (4 rogi)

### Cel

Celem doprecyzowania jest zamkniecie kontraktu danych i zachowania dla czterech paneli HUD na ekranie lotu:
- lewy gorny: reaktor,
- prawy gorny: mini radar,
- prawy dolny: status statku,
- lewy dolny: zaznaczony cel.

Zakres obejmuje model danych, render i aktualizacje runtime. Warstwa wizualna skorki i fontow nie nalezy do tego kontraktu. Kontrakt obejmuje mapowanie kolorow relacji na radarze.

### Parametry wejsciowe

#### 1. Wspolny kontekst HUD
- `timestampMs: number` - czas symulacji dla synchronizacji odswiezania,
- `playerShipId: string` - identyfikator aktywnego statku gracza,
- `hudLayoutId: string` - wariant rozmieszczenia paneli.

#### 2. Prawy gorny - mini radar
- `radar.rangeUnits: number` - biezacy zasieg radaru,
- `radar.baseRangeUnits: number` - bazowy zasieg kadluba,
- `radar.rangeModifier: number` - mnoznik z modulow i efektow,
- `radar.centerWorld: { x: number, y: number }` - pozycja srodka,
- `radar.contacts: RadarContact[]` - kontakty lokalne,
- `radar.noiseSeed: number` - seed do deterministycznego low-res.

`RadarContact`:
- `id: string`,
- `type: "ship" | "station" | "planet" | "star" | "asteroid" | "container" | "wreck" | "projectile" | "other"`,
- `relation: "friendly" | "neutral" | "hostile" | "unknown"`,
- `worldX: number`,
- `worldY: number`,
- `active: boolean`.

Definicja low-res:
- radar renderuje te same klasy obiektow, ktore sa istotne lokalnie dla gracza,
- radar upraszcza reprezentacje kontaktow do minimalnych znacznikow,
- render low-res jest zoptymalizowany pod niski koszt GPU i CPU,
- statki, kontenery i pociski sa renderowane jako pojedyncze piksele,
- asteroidy sa renderowane jako znaczniki posrednie,
- gwiazdy, planety i stacje sa renderowane jako obiekty wieksze od zwyklych kontaktow,
- relacje maja stale mapowanie kolorow: `friendly` - niebieski, `neutral` - bialy, `hostile` - czerwony, `unknown` - szary,
- nowe statusy relacji wymagaja dopisania koloru w konfiguracji.

Konfiguracja startowa runtime (etap 6):
- `baseRangeUnits = 1200`,
- `rangeModifier = 1.0`,
- `minRangeUnits = 300`,
- `rangeUnits = max(minRangeUnits, baseRangeUnits * rangeModifier)`.

#### 3. Prawy dolny - status statku
- `shipStatus.shield.currentHp: number`,
- `shipStatus.shield.maxHp: number`,
- `shipStatus.shield.ringStartDeg: number` - kat poczatkowy pierscienia,
- `shipStatus.armor.segments: ArmorSegment[]`,
- `shipStatus.velocity.currentPxPerSec: number`.

`ArmorSegment`:
- `slotId: string`,
- `currentHp: number`,
- `maxHp: number`,
- `mountArcStartDeg: number`,
- `mountArcSizeDeg: number`.

Dane startowe etapu 6:
- dopuszczalne jest uruchomienie panelu na danych testowych z modelu statku gracza,
- minimalny zestaw testowy: 4 segmenty pancerza po `50/50` oraz osłona `100/100`.

#### 4. Lewy gorny - reaktor
- `reactor.name: string`,
- `reactor.maxOutputMw: number`,
- `reactor.currentUsageMw: number`,
- `reactor.currentUsagePct: number`,
- `reactor.fuel.currentUnits: number`,
- `reactor.fuel.maxUnits: number`,
- `reactor.fuel.pct: number`,
- `reactor.iconKey: string`.

Dane etapu 6:
- do czasu pełnej integracji systemu reaktora dopuszczalne są statyczne dane wizualne,
- wartości statyczne muszą pochodzić z jawnego profilu testowego, bez losowania i bez wartości z palca.

#### 5. Lewy dolny - zaznaczony cel
- `target.selected: boolean`,
- `target.objectId: string | null`,
- `target.objectType: "ship" | "station" | "wreck" | "other" | null`,
- `target.facingDeg: number | null`,
- `target.velocityPxPerSec: number | null`,
- `target.rangeUnits: number | null`,
- `target.shieldPct: number | null`,
- `target.armorPct: number | null`,
- `target.relation: "friendly" | "neutral" | "hostile" | "unknown" | null`.

Interpretacja wartości pustych:
- `null` oznacza brak danych albo brak zastosowania dla danego typu obiektu,
- przy `target.selected = false` panel pozostaje widoczny i renderuje stan pusty.

Źródło danych runtime celu:
- `target` pochodzi z aktywnego systemu targetowania gracza,
- `target.relation` pochodzi z resolvera relacji frakcji,
- gdy brak danych relacji, stosowana jest wartość `unknown`.

### Parametry wyjsciowe

#### 1. Render paneli rogowych
System renderuje stale 4 panele HUD z aktualizacja oparta o biezacy stan runtime:
- panel reaktora (lewy gorny),
- panel radaru (prawy gorny),
- panel statusu statku (prawy dolny),
- panel celu (lewy dolny).

#### 2. Prawy gorny - mini radar
- radar zawsze zachowuje ksztalt kola,
- skala odwzorowania kontaktow wynika z `radar.rangeUnits`,
- zmiana zasiegu po zmianie modulu lub statku aktualizuje mape bez restartu UI,
- filtrowanie kontaktow odbywa sie przed renderem (aktywnosc i zasieg),
- radar renderuje wszystkie kontakty po filtracji, bez dodatkowego limitu ilosciowego.

#### 3. Prawy dolny - status statku
- pierscien oslony reprezentuje proporcje `shield.currentHp / shield.maxHp`,
- segmenty pancerza sa generowane dynamicznie z `armor.segments`,
- liczba segmentow pancerza jest rowna liczbie zamontowanych plyt,
- kazdy segment zwaza sie proporcjonalnie do `currentHp / maxHp`,
- panel pokazuje liczbe predkosci jako `velocity.currentPxPerSec`.

#### 4. Lewy gorny - reaktor
- pasek `power usage` reprezentuje `currentUsagePct`,
- wartosc tekstowa pokazuje jednoczesnie MW i procent,
- nazwa reaktora i moc maksymalna sa wyswietlane razem,
- pasek paliwa reprezentuje `fuel.pct`.

#### 5. Lewy dolny - zaznaczony cel
- panel pokazuje orientacje celu dla obiektow typu `ship`,
- panel pokazuje predkosc celu, dystans, oslone, armor i status relacji,
- panel pozostaje stale widoczny, a przy braku celu renderuje stan pusty.

### Zachowanie

#### 1. Aktualizacja runtime
- odswiezanie wartosci HUD jest wyzwalane zdarzeniami domenowymi i tickiem symulacji,
- kazdy panel pobiera dane tylko ze swojego modelu,
- awaria pojedynczego panelu nie blokuje renderu pozostalych paneli,
- jezeli wartosc jest niedostepna, panel wyswietla `N/A`,
- panel przechowuje `lastDataTick` i przechodzi w stan `nieodswiezony` po 2 kolejnych brakujacych tickach.

#### 2. Radar i skala zasiegu
- zasieg efektywny oblicza sie jako `baseRangeUnits * rangeModifier`,
- wszystkie kontakty sa mapowane do radaru w granicy kola,
- obiekty poza zasiegiem sa odfiltrowywane przed renderem,
- po filtracji radar renderuje wszystkie kontakty.

#### 3. Segmentacja pancerza
- wartosci `mountArcStartDeg` i `mountArcSizeDeg` kontroluja polozenie kazdej plyty,
- przy 1 plycie segment zajmuje pelny pierscien,
- przy N plytach pierscien dzieli sie na N logicznych sekcji,
- porzadek sekcji jest stabilny i zgodny z ukladam slotow statku.

#### 4. Cel i relacje
- status relacji przyjmuje tylko wartosci `friendly`, `neutral`, `hostile`, `unknown`,
- kierunek celu dla `ship` wynika z `facingDeg`,
- dla obiektow nieobrotowych kierunek nie jest renderowany,
- panel celu pozostaje stale obecny nawet bez zaznaczonego obiektu.

### Zachowanie brzegowe

- jezeli `radar.rangeUnits <= 0`, system ustawia zasieg minimalny z konfiguracji runtime,
- jezeli `radar.contacts` jest puste, radar renderuje pusty sektor bez sztucznych kontaktow,
- jezeli `shield.maxHp = 0`, pierscien oslony renderuje stan pusty,
- jezeli segment pancerza ma `maxHp = 0`, segment renderuje 0% i pozostaje w ukladzie,
- jezeli lista `armor.segments` jest pusta, panel statusu pokazuje brak plyt bez lamania layoutu,
- jezeli `target.selected = false`, panel celu renderuje stan pusty z zachowaniem geometrii,
- jezeli `target.objectType != "ship"`, wskaznik kierunku nie jest renderowany,
- jezeli `reactor.maxOutputMw = 0`, `currentUsagePct` jest wymuszone na 0,
- jezeli `reactor.fuel.maxUnits = 0`, `fuel.pct` jest wymuszone na 0,
- jezeli dane licznikow nie nadejda w ticku, panel utrzymuje ostatni poprawny stan i oznacza go jako nieodswiezony,
- jezeli brak danych licznikow i brak ostatniego stanu, panel wyswietla `N/A`,
- jezeli uzytkownik naciska `Esc` na poziomie bazowym menu, system zamyka menu,
- jezeli uzytkownik naciska `Esc` poza menu obiektowym, system otwiera menu gry,
- jezeli uzytkownik naciska `B` poza menu obiektowym, system otwiera menu obiektowe statku gracza,
- jezeli uzytkownik naciska `E` poza menu obiektowym i jest w zasiegu obiektu dokowalnego, system dokuje i otwiera menu obiektowe tego obiektu,
- jezeli uzytkownik naciska `E` poza menu obiektowym i nie ma obiektu dokowalnego w zasiegu, nie jest otwierane zadne menu,
- jezeli wystepuje kolizja skrotu literowego, system przypisuje kolejna litere nazwy, a potem pierwsza wolna litere alfabetycznie.

### Kryterium zgodnosci dla glownego HUD

Wdrozenie jest zgodne z doprecyzowaniem, jezeli:
- wszystkie 4 panele rogow sa stale obecne,
- radar pozostaje okragly i skaluje sie po zmianie zasiegu,
- status statku obsluguje dynamiczna liczbe plyt pancerza,
- oslona i pancerz zmniejszaja sie wizualnie proporcjonalnie do HP,
- prawy dolny panel zawiera predkosc statku w `px/s`,
- panel reaktora pokazuje zuzycie mocy i paliwo jako wartosci oraz procenty,
- menu wykorzystuje model registry + runtime payload, zasilany danymi z encji i seedow,
- etap 6 uruchamia profile menu dla statku gracza, stacji, wraku i kontenera,
- menu jest stale po prawej stronie, a lewa strona sluzy do tresci kontekstowej,
- nawigacja menu obsluguje strzalki, `Enter`, `Esc`, `B`, `E`, mysz i skroty literowe z resolverem kolizji.
