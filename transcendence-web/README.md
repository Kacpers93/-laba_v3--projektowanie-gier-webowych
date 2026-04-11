# transcendence-web

## Cel folderu
Glowne repozytorium aplikacji webowej opartej o Vite i TypeScript. Zawiera konfiguracje uruchomienia oraz kod zrodlowy gry.

## Co zawiera
- `package.json`: skrypty `dev`, `build`, `preview`, `type-check` oraz zaleznosci developerskie.
- `tsconfig.json`: konfiguracja TypeScript i aliasow sciezek.
- `vite.config.ts`: konfiguracja bundlera Vite (aliasy, serwer dev, build).
- `index.html`: punkt wejscia dokumentu HTML i montowanie `#root`.
- `src/`: kod aplikacji i silnika.
- `src/physics/`: podstawowa matematyka 2D wykorzystywana przez logike gry.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: `vite`, `typescript`, `terser`, `@types/node`.
- Wewnetrzne: kod z `src` oraz aliasy `@`, `@engine`, `@physics`, `@world`, `@types`.

## Jak uzywac
```bash
npm install
npm run dev
```

## Dokumentacja plikowa
- Opisy plikow kodu sa trzymane bezposrednio obok kodu jako osobne pliki z sufiksem `.md` (np. `src/app/AppShell.ts.md`).
- Taka konwencja pozwala otworzyc kod i opis w tym samym folderze.
- Duplikaty dokumentacji z `docs/transcendence-web/` zostaly usuniete.

## Czego NIE robi
- Nie zawiera logiki rozgrywki bezposrednio (ta jest w `src`).
- Nie przechowuje danych runtime ani stanu sesji.
