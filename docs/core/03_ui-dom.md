# UI DOM

## Zakres
Ten dokument opisuje interfejs w DOM:
- HUD,
- ekrany pełne,
- modale,
- focus,
- nawigację,
- wspólny model menu,
- stylowanie UI.

## Warstwy aplikacji
`AppShell` tworzy trzy stałe warstwy:
- `#game-layer`
- `#hud-layer`
- `#screen-layer`

## Reguła interakcji
- `#hud-layer` i `#screen-layer` są pasywne.
- Interaktywne są tylko konkretne elementy potomne.
- Kliknięcia i listenery podpinamy do widgetów, paneli i ekranów, nie do głównych overlayów.

## Foldery UI
- `ui/root/`
- `ui/screens/`
- `ui/hud/`
- `ui/widgets/`
- `ui/menus/`
- `ui/state/`
- `ui/navigation/`
- `ui/accessibility/`

## Screen manager
- Jeden aktywny ekran pełny naraz.
- Modale siedzą w osobnym hostcie.
- Otwarcie ekranu przełącza input na `ui`.
- Zamknięcie ostatniego ekranu przywraca `game`.

## HUD
- HUD jest w DOM.
- HUD tylko pokazuje stan i emituje zdarzenia.
- HUD nie wykonuje logiki gry.

## Menu
Dla stacji, wraku, wrót, salvage i statku gracza używamy jednego modelu menu:
- wspólny shell,
- różne konfiguracje,
- różne akcje.

## CSS
- 1 ekran = własny folder + własny plik CSS.
- 1 widget = mały plik TS.
- Bez jednego gigantycznego `global.css`.
- Bez mieszania styli HUD i ekranów w jednym miejscu.