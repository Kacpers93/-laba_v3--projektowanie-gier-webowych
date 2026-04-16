# Transcendence UI - Etap 6

## Cel

Celem etapu 6 jest zbudowanie wspólnego systemu menu i HUD dla wielu obiektów gry, z zachowaniem jednego modelu danych menu oraz osobnych wariantów widoku zależnych od kontekstu obiektu.

UI ma obsługiwać te same mechanizmy na statku, stacji, wraku i innych obiektach świata, ale każdy obiekt ma pobierać tylko własny zestaw dostępnych pozycji z wspólnego katalogu elementów.

W tym etapie nie zamykamy jeszcze wszystkich paneli informacyjnych. Część pól pozostaje otwarta do późniejszego podpinania danych runtime.

## Parametry wejściowe

### 1. Kontekst obiektu
Każdy ekran menu otrzymuje kontekst aktywnego obiektu.

Minimalny zestaw danych:
- `objectType` - typ obiektu, na przykład statek, stacja, wrak, punkt misji.
- `menuProfile` - profil menu przypisany do obiektu.
- `availableNodes` - lista dostępnych pozycji menu dla tego obiektu.
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

## Wyjście

### 1. Menu główne
System generuje drzewo menu dla bieżącego obiektu.

Wynik ma spełniać te warunki:
- menu jest wspólne strukturalnie,
- obiekt widzi tylko dozwolone gałęzie,
- podmenu mogą być rozwijane wielopoziomowo,
- elementy mogą być dziedziczone lub współdzielone między obiektami,
- jedna pozycja może występować w wielu profilach bez duplikowania definicji.

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
- jeden element może być używany w wielu miejscach,
- obiekt może nadpisywać etykietę, opis lub dostępność pozycji,
- drzewo menu może zawierać podmenu i elementy liściowe,
- podmenu zachowują spójny wygląd i zachowanie we wszystkich obiektach.

### 2. Podział odpowiedzialności między obiektami
Obiekt nie definiuje całego interfejsu samodzielnie.

Przykłady:
- statek salvage może korzystać z pozycji modules, inventory, salvage i repair,
- stacja może korzystać z pozycji commodities, dock, missions, services,
- statek gracza może korzystać z ship status, modules, inventory i weapons,
- część pozycji może być współdzielona, jeśli semantyka jest zgodna z obiektem.

### 3. Inventory
Inventory nie jest elementem globalnego UI.

Zasady:
- inventory trafia pod menu ship status,
- inventory jest częścią struktury przypisanej do statku lub innego obiektu, który faktycznie posiada ładunek,
- inventory może być udostępniane jako podmenu, a nie jako osobny główny ekran,
- menu globalne nie pokazuje inventory bez kontekstu obiektu.

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
- panel nie pokazuje broni w tym etapie,
- dane broni zostaną dodane później,
- zakres, tarcze i pancerz pozostają widoczne,
- nazwa celu ma być wyraźnie eksponowana.

### 6. Mini radar
Mini radar ma prezentować lokalny wycinek świata w low-res, z zachowaniem charakteru oryginalnej gry.

Zasady:
- radar pokazuje obiekty w pobliżu,
- radar uwzględnia planety, NPC, jednostki i inne aktywne obiekty,
- radar działa jako widok skrócony, a nie pełna mapa systemowa,
- czytelność ma być ważniejsza niż szczegółowość,
- przedstawienie ma przypominać niskorozdzielczy podgląd pola walki lub sektora.

### 7. Menu rozwijane
Menu ma obsługiwać rozwijanie i zwijanie gałęzi.

Zasady:
- wejście do pozycji z dziećmi otwiera podmenu,
- powrót do poziomu wyżej jest jawny,
- struktura breadcrumb pokazuje aktualną ścieżkę,
- pozycje liściowe wykonują akcję albo otwierają panel kontekstowy,
- podmenu dla obiektu może być częściowo wspólne z innymi obiektami.

## Zachowanie brzegowe

- Jeżeli obiekt nie ma przypisanego profilu menu, system ma użyć profilu domyślnego z minimalnym zestawem pozycji.
- Jeżeli pozycja wspólna nie jest dostępna dla obiektu, nie jest renderowana w jego drzewie menu.
- Jeżeli menu zawiera puste podmenu, system ma pokazać stan bez akcji zamiast łamać strukturę.
- Jeżeli panel reaktora nie ma danych runtime, ma pozostać widoczny jako otwarta sekcja bez sztucznych wartości końcowych.
- Jeżeli cel nie jest zaznaczony, panel lewy dolny pokazuje stan pusty z zachowaniem layoutu.
- Jeżeli radar nie ma obiektów w zasięgu, wyświetla pusty sektor zamiast wymyślonych kontaktów.
- Jeżeli obiekt dziedziczy pozycję z katalogu wspólnego, ale wymaga innej etykiety, etykieta lokalna nadpisuje etykietę bazową bez duplikowania definicji.

## Reguły modelu menu

### Katalog bazowy
Katalog bazowy zawiera definicje funkcjonalne, na przykład:
- identyfikator,
- etykieta,
- opis,
- hotkey,
- akcja,
- dzieci,
- warunki dostępności.

### Profil obiektu
Profil obiektu określa:
- które elementy katalogu bazowego są dostępne,
- które pozycje są domyślnie rozwinięte,
- które etykiety są nadpisane,
- które sekcje widoku są aktywne.

### Dziedziczenie
Dziedziczenie działa na poziomie definicji, a nie na poziomie pojedynczego renderu.

Zasady:
- element bazowy może być użyty przez wiele obiektów,
- obiekt może rozszerzyć element o własne dziecko,
- obiekt może ukryć element bez usuwania go z katalogu,
- modyfikacje dotyczą profilu, nie kopii danych.

## Kryterium zgodności

Wdrożenie etapu 6 jest zgodne z tym dokumentem, jeżeli:
- inventory nie funkcjonuje jako globalna sekcja UI,
- inventory jest dostępne przez ship status lub inny obiektowy profil menu,
- menu działa na wspólnym katalogu elementów,
- stacja, wrak i statek używają różnych profili tego samego systemu,
- reaktor pozostaje otwarty jako sekcja na przyszłe dane,
- lewy dolny panel celu nie pokazuje broni,
- mini radar pokazuje lokalny wycinek świata w low-res.
