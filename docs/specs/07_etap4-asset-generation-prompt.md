# Etap 4 — Prompt do generowania assetów PNG

To jest plik do wklejenia do agenta, kiedy chcesz, żeby wygenerował nowe assety PNG w stylu zgodnym z Etapem 4.

Nie opisuje całego systemu technicznego. Ma tylko prowadzić agenta tak, żeby z krótkiego opisu zrobił poprawny, spójny sprite PNG, który potem możesz przenieść do `public/art/`.

## Kiedy używać

Użyj tego promptu, gdy chcesz powiedzieć agentowi mniej więcej:

- co przedstawia asset,
- do jakiej kategorii należy,
- jaki ma mieć klimat,
- jaki ma mieć rozmiar,
- czy ma być statyczny czy zwrócony w prawo,
- czy ma być bardziej techniczny, organiczny, ciężki, lekki, stary, nowoczesny itd.

## Prompt bazowy

Wklej ten tekst do agenta i uzupełnij nawiasy kwadratowe:

```text
Wygeneruj pojedynczy asset PNG zgodny z Etapem 4.

Opis assetu:
- assetId: [np. scout-mk1]
- kategoria: [ship / station / gate / celestial]
- krótki opis: [np. mały szybki statek zwiadowczy z ostrym dziobem]
- klimat: [np. chłodny, techniczny, lekko agresywny]
- orientacja: [jeśli dotyczy, rotation 0 oznacza front w prawo]
- rozmiar obrazu: [np. 64x40]
- styl: [np. kosmiczny, czytelna sylwetka, umiarkowane detale, transparent background]

Wymagania:
- wygeneruj dokładnie jeden plik PNG,
- tło ma być przezroczyste,
- obraz ma być wycentrowany w ramce,
- sylwetka ma być czytelna przy małym rozmiarze,
- nie zmieniaj nazwy assetId ani kategorii,
- nie dodawaj żadnych dodatkowych plików,
- nie twórz sprite sheetów, atlasów ani animacji,
- jeśli nie da się zrobić bogatego detalu, wybierz prostszy, ale poprawny i spójny wygląd.

Jeśli to jest statek, pokaż go jako zwróconego w prawo.
Jeśli to jest stacja, brama albo ciało niebieskie, ważniejsza jest symetria i czytelny kontur niż orientacja.

Zwróć gotowy PNG i nic więcej.
```

## Jak pisać opis dla agenta

Najlepiej działa krótki opis z 4 elementami:

1. co to jest,
2. jaki ma charakter,
3. jakie ma mieć kształty dominujące,
4. jaką ma mieć paletę lub nastrój.

Przykład:

```text
Wygeneruj asset PNG dla małej stacji handlowej. Ma wyglądać modularnie, symetrycznie i technologicznie, z niebiesko-srebrną paletą i wyraźnym, centralnym rdzeniem. Transparent background, wycentrowany kształt, styl pasujący do kosmicznej gry 2D.
```

## Dobre cechy wygenerowanego assetu

- prosta, czytelna sylwetka,
- spójna paleta z resztą assetów,
- brak tła,
- brak rozmytego chaosu wokół obiektu,
- ma być dobrze widoczny w grze, nie tylko „ładny” w podglądzie,
- dla statków front w prawo,
- dla planet, stacji i wrót ważniejsza jest forma niż kierunek.

## Czego agent nie ma robić

- nie zmieniaj kategorii,
- nie wymyślaj nowych assetów,
- nie twórz kilku wariantów zamiast jednego,
- nie dodawaj tekstu do obrazu,
- nie doklejaj ramek, podpisów ani szumów,
- nie zapisuj jako JPG albo WebP,
- nie zmieniaj proporcji poza zadany rozmiar.

## Jeśli chcesz wygenerować serię assetów

Powiedz agentowi osobno dla każdego pliku:

```text
Asset 1:
- assetId: scout-mk1
- category: ship
- size: 64x40
- description: mały zwiadowczy statek z ostrą sylwetką, techniczny, lekki, dynamiczny, front w prawo

Asset 2:
- assetId: freighter-standard
- category: ship
- size: 96x64
- description: duży statek transportowy, masywny kadłub, cargo feel, front w prawo
```

## Minimalna instrukcja jakości

Jeśli agent ma wątpliwości, ma priorytetowo:

- zachować transparent background,
- zachować czytelność w małym rozmiarze,
- utrzymać spójność ze stylem kosmicznej gry,
- unikać przesadnych detali, które zginą po zmniejszeniu,
- nie zmieniać specyfikacji technicznej.

## Powiązane pliki

- `06_etap4-asset-generation.md`
- `10_etap4-specyfikacja.md`
- `public/art/asset-manifest.json`