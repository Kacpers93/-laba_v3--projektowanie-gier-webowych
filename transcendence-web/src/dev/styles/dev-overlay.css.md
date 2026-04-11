## Cel pliku
Plik zawiera style panelu deweloperskiego: kontener, sekcje, metryki i kontrolki. Definiuje wyglad oraz zachowanie wizualne stanu collapsed.

## Co eksportuje
Plik niczego nie eksportuje (arkusz CSS).

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: CSS w przegladarce.
- Wewnetrzne: ladowany dynamicznie w trybie DEV przez src/main.ts; klasy uzywane przez src/dev/DevOverlayPanel.ts i src/dev/DevSection.ts.

## Jak uzywac (minimalny przyklad)
```ts
if (import.meta.env.DEV) {
  void import('@dev/styles/dev-overlay.css');
}
```

## Czego NIE robi
- Nie tworzy elementow panelu w DOM.
- Nie aktualizuje metryk runtime.
