## Cel pliku
Plik definiuje metadane projektu Node oraz skrypty developerskie i build. Okresla tez zaleznosci developerskie wymagane przez Vite i TypeScript.

## Co eksportuje
Plik niczego nie eksportuje (plik konfiguracyjny JSON).

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: npm, vite, typescript, terser, @types/node.
- Wewnetrzne: skrypty odnosza sie do konfiguracji projektu i kodu src.

## Jak uzywac (minimalny przyklad)
```bash
npm run dev
npm run build
npm run type-check
```

## Czego NIE robi
- Nie zawiera konfiguracji aliasow TypeScript.
- Nie przechowuje logiki aplikacyjnej.
