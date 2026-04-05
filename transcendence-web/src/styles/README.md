# src/styles

## Cel folderu
Style globalne i warstwowe wymagane przez shell aplikacji.

## Co zawiera
- `reset.css`: podstawowy reset i ustawienie pelnego viewportu.
- `layers.css`: pozycjonowanie i `z-index` warstw `#game-layer`, `#hud-layer`, `#screen-layer`.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: standard CSS.
- Wewnetrzne: importowane w `src/main.ts`.

## Jak uzywac
```ts
import '@/styles/reset.css';
import '@/styles/layers.css';
```

## Czego NIE robi
- Nie zawiera komponentowych stylow UI.
- Nie definiuje systemu tematow ani tokenow designu.
