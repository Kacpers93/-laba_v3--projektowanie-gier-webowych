## Cel pliku
Plik konfiguruje kompilator TypeScript dla projektu i aliasy sciezek importu. Definiuje tez zakres plikow objetych type-checkingiem.

## Co eksportuje
Plik niczego nie eksportuje (plik konfiguracyjny JSON).

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: TypeScript, vite/client types, node types.
- Wewnetrzne: aliasy do katalogow src (m.in. @engine, @presentation, @entities).

## Jak uzywac (minimalny przyklad)
```bash
npm run type-check
```

## Czego NIE robi
- Nie uruchamia kompilacji emitujacej pliki JS (noEmit = true).
- Nie konfiguruje bundlera Vite.
