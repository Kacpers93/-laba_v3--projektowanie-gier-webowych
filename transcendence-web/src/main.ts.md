## Cel pliku
Plik jest punktem wejscia aplikacji webowej. Laduje style, uruchamia bootstrap i warunkowo dolacza style panelu deweloperskiego w trybie DEV.

## Co eksportuje
Plik niczego nie eksportuje.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: mechanizm ESM przegladarki i import.meta.env.
- Wewnetrzne: src/styles/reset.css, src/styles/layers.css, src/app/Bootstrap.ts, src/dev/styles/dev-overlay.css (dynamicznie w DEV).

## Jak uzywac (minimalny przyklad)
```ts
import './main.ts';
```

## Czego NIE robi
- Nie tworzy ani nie zarzadza instancjami silnika bezposrednio.
- Nie obsluguje bledow runtime poza tym, co dzieje sie w bootstrap.
