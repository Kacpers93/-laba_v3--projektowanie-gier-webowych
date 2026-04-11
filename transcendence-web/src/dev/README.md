# src/dev

## Cel folderu
Narzędzia deweloperskie uruchamiane w trybie DEV: panel diagnostyczny, sekcje metryk i style pomocnicze.

## Co zawiera
- DevOverlayPanel.ts: panel runtime z sekcjami metryk i kontrolkami.
- DevSection.ts: model i render pojedynczej sekcji panelu.
- types.ts: kontrakty TypeScript dla metryk i kontrolek.
- styles/dev-overlay.css: style panelu developerskiego.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: DOM API, localStorage, CSS.
- Wewnetrzne: laczone z src/main.ts i src/app/AppShell.ts.

## Jak uzywac
Panel jest ladowany warunkowo w trybie DEV i montowany przez AppShell.

## Dokumentacja plikowa
- Opisy plikow sa obok kodu: DevOverlayPanel.ts.md, DevSection.ts.md, types.ts.md, styles/dev-overlay.css.md.

## Czego NIE robi
- Nie uruchamia aplikacji samodzielnie.
- Nie zawiera logiki gameplay.
