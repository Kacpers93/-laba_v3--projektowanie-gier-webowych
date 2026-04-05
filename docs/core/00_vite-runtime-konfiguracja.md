# Vite — Runtime i Konfiguracja

## Cel
Dokument opisuje warstwę buildowania, konfiguracji środowiska developerskiego i runtime aplikacji. Vite jest narzędziem, które łączy etap wytwarzania (development server) z etapem produkcji (build bundle).

Struktura repozytorium i podział katalogów opisany jest w dokumentach [architecture.md](architecture.md) oraz [01_runtime-engine.md](01_runtime-engine.md).

## Rola poszczególnych plików root

| Plik | Odpowiedzialność |
|------|-----------------|
| `index.html` | HTML entry point — osadza `#root` i ładuje `src/main.ts` |
| `package.json` | Zależności, skrypty dev/build/preview, poddelegowanie do Vite |
| `tsconfig.json` | Opcje kompilatora TypeScript (ścieżki, target, moduły) |
| `vite.config.ts` | Konfiguracja dev servera, bundle builder, aliasy, pluginy |

## Punkt wejścia aplikacji

Proces inicjalizacji:

```
1. Przeglądarka ładuje index.html
   ↓
2. index.html osadza <div id="root"></div>
   ↓
3. index.html script type="module" → src/main.ts
   ↓
4. src/main.ts → Bootstrap.ts → AppShell.ts
   ↓
5. AppShell inicjuje engine, GameLoop i renderer
```

## Skrypty w package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

| Skrypt | Działanie |
|--------|----------|
| `npm run dev` | Uruchamia dev server na http://localhost:5173 z hot module reload (HMR) |
| `npm run build` | Buduje minimalny bundle do `dist/` dla produkcji |
| `npm run preview` | Symuluje bundle w dev serwerze |
| `npm run type-check` | Sprawdza typy TypeScript bez budowania |

## Konfiguracja index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Transcendence</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

## Konfiguracja vite.config.ts

```typescript
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@physics': path.resolve(__dirname, './src/physics'),
      '@world': path.resolve(__dirname, './src/world'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },
  
  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
```

## Rola public/ i src/

### public/

- Zasoby umieszczane się jako-są do `dist/` podczas buildu
- Dostęp w kodzie: `/art/sprite.png`, `/audio/sfx.mp3`
- Nigdy nie importujemy pliki z `public/` w JS/TS — używamy URL
- Ścieżka w dev serwerze: dostępne na `/` (root)

```typescript
// ✅ Prawidłowo
const textureUrl = '/art/sprites/ship.png'
const audioUrl = '/audio/engine.mp3'

// ❌ Źle
import spriteFile from '/public/art/sprites/ship.png'
```

### src/

- Kod TypeScript/JavaScript importujemy normalnie
- Vite transformuje TypeScript na JavaScript
- Modułów szukamy względem root (`@/engine/...`)
- Style mogą być w JavaScripcie (CSS-in-JS) lub `.css` importowane

```typescript
// ✅ Prawidłowo
import '@/styles/reset.css'
import '@/styles/layers.css'
import { bootstrap } from './app/Bootstrap.ts'
void bootstrap()

// ❌ Źle
import { GameEngine } from '../../src/engine/Engine'
```

W obecnej implementacji style są ładowane przez importy w `src/main.ts`, a `index.html` pozostaje minimalny.

## Tryby działania

### Development (npm run dev)

- Vite śledzi zmiany w szerokim `src/` i `index.html`
- Hot Module Replacement (HMR) pozwala na reload bez pełnego odświeżenia
- Mapowanie źródeł (sourcemaps) działa automatycznie
- Console w DevTools pokazuje błędy TypeScript na bieżąco

### Production (npm run build)

- Vite minimalizuje JS/CSS
- Usuwa dead code (tree-shaking)
- Bundluje zasoby w `dist/`
- Generuje hashes do plików dla cache-busting
- Domyślnie brak sourcemap'ów

## Zachowania brzegowe

1. **Zmiana vite.config.ts** — dev server trzeba restartować ręcznie
2. **Nowy plik w public/** — dostępny od razu w dev serwerze
3. **Import z public/ z kodu JS** — NIE działa, trzeba URL jako string
4. **TypeScript strict mode** — ON (wymagane od Etapu 1)
5. **Canvas i warstwy UI** — tworzone w runtime przez `AppShell`, nie bezpośrednio w index.html

## Związki z dokumentem architecture.md

- Dokument [architecture.md](architecture.md) opisuje kompletną strukturę repozytorium i podział odpowiedzialności między warstwy
- Ten dokument skupia się na konfiguracji Vite i runtime: jak projekt się startuje, buduje i gdzie siedzi infrastruktura
- `transcendence-web/` zawiera wszystkie pliki specyficzne dla buildu (Vite, konfiguracja, `src/`, `public/`)
- `docs/` siedzi na równi z `transcendence-web/` i zawiera dokumentację techniczną
