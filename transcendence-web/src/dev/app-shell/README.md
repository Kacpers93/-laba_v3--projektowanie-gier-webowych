# src/dev/app-shell

## Cel folderu
Wydzielona logika konfiguracji dev-overlay powiazana z AppShell.

## Co zawiera
- `contracts.ts`: kontrakty typow overlay i formularza dev-spawn.
- `registerAppShellDevOverlay.ts`: rejestracja sekcji metryk/kontrolek dev-overlay.
- `registerDevSpawnSection.ts`: rejestracja formularza dev-spawn.
- `index.ts`: re-export API folderu.

## Czego NIE robi
- Nie tworzy i nie montuje panelu (`DevOverlayPanel`) samodzielnie.
- Nie zarzadza lifecycle gry poza konfiguracja overlay.
