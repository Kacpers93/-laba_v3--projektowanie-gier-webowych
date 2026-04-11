## Cel pliku
Plik konfiguruje Vite dla uruchamiania i budowania aplikacji. Definiuje aliasy importow, ustawienia serwera developerskiego i parametry build.

## Co eksportuje
- Domyslny export defineConfig(...)

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: vite, path, url (fileURLToPath).
- Wewnetrzne: aliasy wskazuja katalogi src projektu.

## Jak uzywac (minimalny przyklad)
```ts
import config from './vite.config';
```

## Czego NIE robi
- Nie zawiera konfiguracji TypeScript compiler.
- Nie definiuje runtime logiki aplikacji.
