import type { InputMode } from '@/types/common';

type ModeListener = (mode: InputMode) => void;

export class InputModeManager {
  private readonly listeners = new Set<ModeListener>();
  private currentMode: InputMode = 'game';

  public get mode(): InputMode {
    return this.currentMode;
  }

  public setMode(mode: InputMode): void {
    if (this.currentMode === mode) {
      return;
    }

    this.currentMode = mode;
    const event = new CustomEvent<InputMode>('input-mode-changed', {
      detail: this.currentMode,
    });
    window.dispatchEvent(event);

    this.listeners.forEach((listener) => listener(this.currentMode));
  }

  public onModeChanged(cb: ModeListener): void {
    this.listeners.add(cb);
  }
}
