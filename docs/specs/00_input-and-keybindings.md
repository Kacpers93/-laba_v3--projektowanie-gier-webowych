# Input i key bindings

> Status: v1.0
> Pliki implementacyjne:
> `src/engine/input/InputAction.ts`
> `src/engine/input/KeyBindings.ts`
> `src/engine/input/InputBindingsStore.ts`
> `src/engine/input/KeyboardMatcher.ts`
> `src/engine/input/GameInput.ts`
> `src/engine/input/UIInput.ts`
> `src/engine/input/InputModeManager.ts`
> `src/ui/screens/controls/ControlsScreen.ts`

## Zasada podstawowa

Klawisze są zdefiniowane w jednym miejscu.
Żaden system, ekran, widget ani komponent nie ma wpisanego literalnie żadnego `event.code`.
Cały kod pyta wyłącznie o akcje, nie o klawisze.

## Akcje

Akcja to nazwany event intencji gracza, niezależny od fizycznego klawisza.
Definicja wszystkich akcji siedzi w `InputAction.ts`.

### Akcje lotu (aktywne tylko w trybie `game`)

| Akcja | Domyślny klawisz |
|---|---|
| `rotate-left` | A |
| `rotate-right` | D |
| `rear-thruster` | W |
| `front-thruster` | S |
| `fire-weapon` | Space |
| `fire-missile` | Shift lewy |
| `toggle-flight-assist` | Ctrl lewy |
| `toggle-target-heading` | F |
| `target-next-enemy` | Q |
| `target-next-friendly` | — |
| `cycle-target` | — |
| `clear-target` | — |
| `accelerate-time` | T |
| `use-item` | — |

### Akcje UI / nawigacja (aktywne w trybie `game` lub `ui`)

| Akcja | Domyślny klawisz |
|---|---|
| `dock-or-enter-stargate` | E |
| `system-map` | 1 |
| `stargate-map` | 2 |
| `ship-status-menu` | C |
| `toggle-hud` | — |
| `toggle-device-menu` | — |
| `pause-game` | P |
| `game-menu` | Escape |
| `game-stats` | — |

Akcje oznaczone `—` istnieją w systemie, ale nie mają domyślnego klawisza.
W ekranie ustawień sterowania pokazują się jako „nieprzypisane" i gracz może je tam ustawić.

## Tryby wejścia

Trzy stany zarządzane przez `InputModeManager`:

- `game` — aktywny podczas lotu.
- `ui` — aktywny w ekranach, menu, inventory, pauzie.
- `locked` — aktywny podczas ładowania systemu, przejścia przez wrota i fade-ów.

`GameInput` reaguje tylko w trybie `game`.
`UIInput` reaguje tylko w trybie `ui`.
`MouseTracker` działa zawsze, ale akcje wykonuje tylko aktywny tryb.

Przejścia:

```txt
start gry            -> main-menu + ui
wejście do lotu      -> hud visible + game
pauza / ekran / menu -> screen visible + ui
gate transit         -> locked
powrót do lotu       -> screen hidden + game
```

## Architektura modułów

```txt
InputAction.ts
  -> lista wszystkich akcji (string union)

KeyBindings.ts
  -> domyślna mapa akcja -> KeyCode

InputBindingsStore.ts
  -> aktualny stan bindingów
  -> load() z localStorage
  -> save() do localStorage
  -> set(), get(), resetToDefaults()
  -> findActionByKey() do obsługi konfliktu

KeyboardMatcher.ts
  -> matches(event, action) => boolean
  -> getBoundKey(action) => string | null

GameInput.ts
  -> isActionPressed(event, action) => boolean
  -> aktywny tylko w trybie game

UIInput.ts
  -> isActionPressed(event, action) => boolean
  -> aktywny tylko w trybie ui

ControlsScreen.ts
  -> UI do rebindowania akcji
  -> nasłuch keydown tylko w fazie "waiting"
  -> wykrywanie konfliktów przez InputBindingsStore.findActionByKey()
  -> resetToDefaults() + save() dla pełnego resetu
```

## Reguły wykonawcze

- Nikt poza `KeyboardMatcher` nie porównuje `event.code` z literalnym stringiem w logice gry.
- Wyjątek: `ControlsScreen` w trybie rebindowania odczytuje `event.code` bezpośrednio, bo to ekran konfiguracji klawiszy.
- Każda nowa akcja dostaje wpis w `InputAction.ts` jako pierwszy krok.
- Każda nowa akcja dostaje wpis w `KeyBindings.ts` — może być `null`.
- Żaden komponent UI nie importuje `KeyBindings.ts` bezpośrednio.
- Komponenty UI które chcą pokazać etykietę klawisza używają `KeyboardMatcher.getBoundKey(action)`.

## Konflikty

Jeden klawisz może być przypisany tylko do jednej akcji.
`InputBindingsStore.findActionByKey(code)` służy do detekcji konfliktu
podczas zapisywania nowego bindingu w ekranie ustawień.

Przy wykryciu konfliktu ekran sterowania pokazuje ostrzeżenie i pozwala
graczowi zdecydować, czy chce nadpisać istniejący binding, czy wybrać inny klawisz.

## Ekran sterowania (`ControlsScreen`)

Ekran `ControlsScreen` jest warstwą UI nad `InputBindingsStore` i obsługuje cały flow rebindowania:

- Kliknięcie przycisku klawisza przełącza wiersz akcji do fazy `waiting`.
- Następny `keydown` próbuje przypisać nowy `KeyCode` do tej akcji.
- `Escape` anuluje bieżące oczekiwanie i przywraca poprzedni stan.
- Jeśli klawisz jest już przypisany do innej akcji, pojawia się banner konfliktu z opcją `Overwrite` lub `Cancel`.
- `Overwrite` odpina konfliktującą akcję (`null`) i przypisuje klawisz do docelowej akcji.
- Każda zmiana i reset są natychmiast zapisywane przez `store.save()`.

Dodatkowo ekran udostępnia:

- `Reset to Defaults` -> `resetToDefaults()` + `save()`.
- `Back` -> event `controls:close` (bubble) do zamknięcia przez `ScreenManager`.
- Formatowanie etykiet klawiszy (`KeyA` -> `A`, `ControlLeft` -> `Ctrl`, `Escape` -> `Esc`, brak przypisania -> `—`).

## Persystencja

Bindingi są zapisywane przez `InputBindingsStore.save()` do `localStorage`
pod kluczem `game.input.bindings`.

Przy ładowaniu gry `InputBindingsStore.load()` nakłada zachowane bindingi
na `DEFAULT_KEY_BINDINGS`, więc nowe akcje dodane po stronie kodu
automatycznie dostają domyślne klawisze, nawet jeśli gracz ma już zapisany profil.

## Poza zakresem

Ten system nie:
- obsługuje gamepadów ani joysticków,
- zarządza skrótami klawiszowymi wewnątrz ekranów UI (to `UIInput`),
- przechowuje wielu profili ustawień jednocześnie.