import { InputModeManager } from './InputModeManager';

type Direction = 'up' | 'down' | 'left' | 'right';

export class UIInput {
  private readonly navigateListeners = new Set<(direction: Direction) => void>();
  private readonly confirmListeners = new Set<() => void>();
  private readonly cancelListeners = new Set<() => void>();

  public constructor(private readonly modeManager: InputModeManager) {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  public onNavigate(cb: (direction: Direction) => void): void {
    this.navigateListeners.add(cb);
  }

  public onConfirm(cb: () => void): void {
    this.confirmListeners.add(cb);
  }

  public onCancel(cb: () => void): void {
    this.cancelListeners.add(cb);
  }

  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.modeManager.mode !== 'ui') {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === 'arrowup') {
      this.navigateListeners.forEach((listener) => listener('up'));
      return;
    }

    if (key === 'arrowdown') {
      this.navigateListeners.forEach((listener) => listener('down'));
      return;
    }

    if (key === 'arrowleft') {
      this.navigateListeners.forEach((listener) => listener('left'));
      return;
    }

    if (key === 'arrowright') {
      this.navigateListeners.forEach((listener) => listener('right'));
      return;
    }

    if (key === 'enter' || key === ' ') {
      this.confirmListeners.forEach((listener) => listener());
      return;
    }

    if (key === 'escape') {
      this.cancelListeners.forEach((listener) => listener());
    }
  };
}
