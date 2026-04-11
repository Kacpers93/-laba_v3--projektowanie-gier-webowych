## Cel pliku
Plik jest dokumentem HTML startowym aplikacji i zawiera kontener root. Laduje modul ESM src/main.ts jako punkt wejscia frontend.

## Co eksportuje
Plik niczego nie eksportuje.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: przegladarka (HTML, module script).
- Wewnetrzne: src/main.ts.

## Jak uzywac (minimalny przyklad)
```html
<script type="module" src="/src/main.ts"></script>
```

## Czego NIE robi
- Nie zawiera logiki runtime gry.
- Nie definiuje warstw canvas poza kontenerem root.
