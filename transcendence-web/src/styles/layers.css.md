## Cel pliku
Plik definiuje pozycjonowanie i z-index warstw AppShell: game, hud i screen. Zapewnia, ze wszystkie warstwy pokrywaja viewport.

## Co eksportuje
Plik niczego nie eksportuje (arkusz CSS).

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CSS w przegladarce.
- Wewnetrzne: ladowany przez src/main.ts; dotyczy elementow tworzonych w src/app/AppShell.ts.

## Jak uzywac (minimalny przyklad)
```ts
import '@/styles/layers.css';
```

## Czego NIE robi
- Nie definiuje typografii i stylu panelu dev.
- Nie zarzadza rozmiarem canvas przez JS.
