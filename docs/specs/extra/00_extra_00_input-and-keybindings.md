# Dodatkowe informacje z kodu do bindings

Plik zbiera praktyczne szczegóły implementacyjne dla ekranu sterowania i styli UI,
które uzupełniają główną specyfikację `input-and-keybindings.md`.

## Najważniejsze zachowania

- `ControlsScreen` buduje tabelę wszystkich akcji z listy `ACTION_LABELS`.
- Wejście w tryb rebindowania ustawia stan `waiting` i podświetla aktywny wiersz.
- W trybie `waiting` tylko pierwszy `keydown` jest interpretowany jako nowy binding.
- `Escape` przerywa rebinding bez zapisu zmian.
- Konflikty klawiszy wykrywa `store.findActionByKey(code)`.
- W konflikcie użytkownik może nadpisać istniejący binding (`Overwrite`) albo anulować (`Cancel`).
- Każda skuteczna zmiana oraz reset domyślnych ustawień kończy się `store.save()`.
- Zamknięcie ekranu emituje event `controls:close` do obsługi przez `ScreenManager`.

## `src/ui/screens/controls/ControlsScreen.ts`

```ts
import type { InputAction } from '../../../engine/input/InputAction';
import type { KeyCode } from '../../../engine/input/KeyBindings';
import { InputBindingsStore } from '../../../engine/input/InputBindingsStore';

interface ActionRow {
  action: InputAction;
  label: string;
}

const ACTION_LABELS: ActionRow[] = [
  { action: 'rotate-left',             label: 'Rotate Left' },
  { action: 'rotate-right',            label: 'Rotate Right' },
  { action: 'rear-thruster',           label: 'Rear Thruster' },
  { action: 'front-thruster',          label: 'Front Thruster' },
  { action: 'fire-weapon',             label: 'Fire Weapon' },
  { action: 'fire-missile',            label: 'Fire Missile' },
  { action: 'toggle-flight-assist',    label: 'Flight Assist On/Off' },
  { action: 'toggle-target-heading',   label: 'Target Heading On/Off' },
  { action: 'target-next-enemy',       label: 'Target Next Enemy' },
  { action: 'target-next-friendly',    label: 'Target Next Friendly' },
  { action: 'cycle-target',            label: 'Cycle Target' },
  { action: 'clear-target',            label: 'Clear Target' },
  { action: 'accelerate-time',         label: 'Accelerate Time' },
  { action: 'use-item',                label: 'Use Item' },
  { action: 'dock-or-enter-stargate',  label: 'Dock / Enter Stargate' },
  { action: 'system-map',              label: 'System Map' },
  { action: 'stargate-map',            label: 'Stargate Map' },
  { action: 'ship-status-menu',        label: 'Ship Status Menu' },
  { action: 'toggle-hud',              label: 'Show / Hide HUD' },
  { action: 'toggle-device-menu',      label: 'Devices / Weapons Menu' },
  { action: 'pause-game',              label: 'Pause Game' },
  { action: 'game-menu',               label: 'Game Menu' },
  { action: 'game-stats',              label: 'Game Stats' },
];

type ScreenState =
  | { phase: 'idle' }
  | { phase: 'waiting'; action: InputAction; rowEl: HTMLElement };

export class ControlsScreen {
  private root: HTMLElement | null = null;
  private state: ScreenState = { phase: 'idle' };
  private conflictBanner: HTMLElement | null = null;

  private readonly onKeyDown: (e: KeyboardEvent) => void;

  constructor(private readonly store: InputBindingsStore) {
    this.onKeyDown = this.handleKeyDown.bind(this);
  }

  mount(parent: HTMLElement): void {
    this.root = document.createElement('div');
    this.root.className = 'screen controls-screen';

    const title = document.createElement('h2');
    title.textContent = 'Controls';
    this.root.appendChild(title);

    this.conflictBanner = document.createElement('div');
    this.conflictBanner.className = 'controls-conflict-banner hidden';
    this.root.appendChild(this.conflictBanner);

    const table = this.buildTable();
    this.root.appendChild(table);

    const footer = this.buildFooter();
    this.root.appendChild(footer);

    parent.appendChild(this.root);
    window.addEventListener('keydown', this.onKeyDown);
  }

  unmount(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    this.root?.remove();
    this.root = null;
    this.state = { phase: 'idle' };
  }

  private buildTable(): HTMLElement {
    const table = document.createElement('table');
    table.className = 'controls-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Action', 'Key'].forEach((text) => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    for (const { action, label } of ACTION_LABELS) {
      const row = document.createElement('tr');
      row.dataset.action = action;
      row.className = 'controls-row';

      const labelCell = document.createElement('td');
      labelCell.textContent = label;

      const keyCell = document.createElement('td');
      const keyBtn = document.createElement('button');
      keyBtn.className = 'controls-key-btn ui-clickable';
      keyBtn.textContent = this.keyLabel(this.store.get(action));
      keyBtn.addEventListener('click', () => this.startRebind(action, row, keyBtn));

      keyCell.appendChild(keyBtn);
      row.appendChild(labelCell);
      row.appendChild(keyCell);
      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    return table;
  }

  private buildFooter(): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'controls-footer';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'ui-clickable';
    resetBtn.textContent = 'Reset to Defaults';
    resetBtn.addEventListener('click', () => this.resetAll());

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ui-clickable';
    closeBtn.textContent = 'Back';
    closeBtn.addEventListener('click', () => this.close());

    footer.appendChild(resetBtn);
    footer.appendChild(closeBtn);
    return footer;
  }

  private startRebind(action: InputAction, rowEl: HTMLElement, btn: HTMLButtonElement): void {
    if (this.state.phase === 'waiting') {
      this.cancelWaiting();
    }

    this.state = { phase: 'waiting', action, rowEl };
    rowEl.classList.add('controls-row--waiting');
    btn.textContent = '...';
    this.hideConflict();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.state.phase !== 'waiting') return;

    event.preventDefault();

    if (event.code === 'Escape') {
      this.cancelWaiting();
      return;
    }

    const { action, rowEl } = this.state;
    const newCode = event.code as KeyCode;

    const existingAction = this.store.findActionByKey(newCode);

    if (existingAction && existingAction !== action) {
      this.showConflict(existingAction, newCode, action, rowEl);
      return;
    }

    this.applyBinding(action, newCode, rowEl);
  }

  private showConflict(
    conflictingAction: InputAction,
    newCode: KeyCode,
    targetAction: InputAction,
    rowEl: HTMLElement
  ): void {
    if (!this.conflictBanner) return;

    const conflictLabel = ACTION_LABELS.find((r) => r.action === conflictingAction)?.label ?? conflictingAction;

    this.conflictBanner.innerHTML = '';
    this.conflictBanner.classList.remove('hidden');

    const msg = document.createElement('span');
    msg.textContent = `"${this.keyLabel(newCode)}" is already bound to "${conflictLabel}". Overwrite?`;

    const yesBtn = document.createElement('button');
    yesBtn.className = 'ui-clickable';
    yesBtn.textContent = 'Overwrite';
    yesBtn.addEventListener('click', () => {
      this.store.set(conflictingAction, null);
      this.updateRowButton(conflictingAction, null);
      this.applyBinding(targetAction, newCode, rowEl);
      this.hideConflict();
    });

    const noBtn = document.createElement('button');
    noBtn.className = 'ui-clickable';
    noBtn.textContent = 'Cancel';
    noBtn.addEventListener('click', () => {
      this.cancelWaiting();
      this.hideConflict();
    });

    this.conflictBanner.appendChild(msg);
    this.conflictBanner.appendChild(yesBtn);
    this.conflictBanner.appendChild(noBtn);
  }

  private applyBinding(action: InputAction, key: KeyCode | null, rowEl: HTMLElement): void {
    this.store.set(action, key);
    this.store.save();
    this.updateRowButton(action, key);
    rowEl.classList.remove('controls-row--waiting');
    this.state = { phase: 'idle' };
  }

  private cancelWaiting(): void {
    if (this.state.phase !== 'waiting') return;
    const { action, rowEl } = this.state;
    rowEl.classList.remove('controls-row--waiting');
    this.updateRowButton(action, this.store.get(action));
    this.state = { phase: 'idle' };
  }

  private updateRowButton(action: InputAction, key: KeyCode | null): void {
    const row = this.root?.querySelector(`tr[data-action="${action}"]`);
    const btn = row?.querySelector<HTMLButtonElement>('.controls-key-btn');
    if (btn) btn.textContent = this.keyLabel(key);
  }

  private hideConflict(): void {
    this.conflictBanner?.classList.add('hidden');
  }

  private resetAll(): void {
    this.store.resetToDefaults();
    this.store.save();

    for (const { action } of ACTION_LABELS) {
      this.updateRowButton(action, this.store.get(action));
    }
  }

  private close(): void {
    this.root?.dispatchEvent(new CustomEvent('controls:close', { bubbles: true }));
  }

  private keyLabel(key: KeyCode | null): string {
    if (!key) return '—';

    const labels: Partial<Record<string, string>> = {
      KeyA: 'A',
      KeyD: 'D',
      KeyW: 'W',
      KeyS: 'S',
      KeyE: 'E',
      KeyF: 'F',
      KeyP: 'P',
      KeyC: 'C',
      KeyQ: 'Q',
      KeyT: 'T',
      Digit1: '1',
      Digit2: '2',
      Space: 'Space',
      ShiftLeft: 'Shift',
      ControlLeft: 'Ctrl',
      Escape: 'Esc',
    };

    return labels[key] ?? key;
  }
}
```


## `src/ui/screens/controls/controls.css`

```css
.controls-screen {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  max-width: 640px;
  margin: 0 auto;
}

.controls-table {
  width: 100%;
  border-collapse: collapse;
}

.controls-table th,
.controls-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.controls-table th {
  color: var(--color-muted);
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.controls-row--waiting td {
  background: var(--color-highlight-subtle);
}

.controls-key-btn {
  min-width: 80px;
  text-align: center;
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  color: var(--color-text);
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
}

.controls-key-btn:hover {
  border-color: var(--color-accent);
}

.controls-conflict-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning);
  color: var(--color-warning-text);
}

.controls-conflict-banner.hidden {
  display: none;
}

.controls-footer {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}
```


## Jak podpiąć pod `ScreenManager`

Żeby `ControlsScreen` działał razem z resztą systemu ekranów, trzeba go zarejestrować w `ScreenManager` tak samo jak `pause` czy `inventory`. Jedyna różnica to to, że ekran sterowania powinien być dostępny zarówno z `pause`, jak i z `main-menu`, więc nie ma własnej akcji klawiszowej i jest otwierany wyłącznie przez kliknięcie przycisku w tych dwóch ekranach.

```ts
// w ScreenManager.ts — dodaj do ScreenId
type ScreenId =
  | 'main-menu'
  | 'pause'
  | 'dock'
  | 'salvage'
  | 'inventory'
  | 'ship-status'
  | 'controls';   // <-- nowe

// w Bootstrap.ts lub GameRuntime.ts
const controlsScreen = new ControlsScreen(inputBindingsStore);
screenManager.register('controls', controlsScreen);

// zamknięcie z poziomu ekranu
document.addEventListener('controls:close', () => {
  screenManager.close('controls');
});
```

