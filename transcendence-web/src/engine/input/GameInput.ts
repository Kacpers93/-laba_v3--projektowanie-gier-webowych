import type { Vector2 } from '@/types/common';
import type { Camera } from '@engine/renderer/Camera';
import { FLIGHT_KEY_MAP } from '@systems/flight/FlightActions';
import { InputModeManager } from './InputModeManager';

export class GameInput {
  private readonly keyState = new Set<string>();
  private readonly actionListeners = new Map<string, Set<() => void>>();
  private readonly bufferedActions: string[] = [];

  private camera: Camera | null = null;
  private mouseScreenPos: Vector2 = { x: 0, y: 0 };
  private currentMouseWorldPos: Vector2 = { x: 0, y: 0 };

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly modeManager: InputModeManager,
  ) {
    this.canvas.tabIndex = 0;
    this.canvas.addEventListener('keydown', this.handleKeyDown);
    this.canvas.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('click', this.focusCanvas);
  }

  public get mouseWorldPos(): Vector2 {
    return this.currentMouseWorldPos;
  }

  public setCamera(camera: Camera): void {
    this.camera = camera;
  }

  public isKeyDown(key: string): boolean {
    return this.keyState.has(key.toLowerCase());
  }

  public onAction(action: string, cb: () => void): void {
    const listeners = this.actionListeners.get(action) ?? new Set<() => void>();
    listeners.add(cb);
    this.actionListeners.set(action, listeners);
  }

  public update(): void {
    if (this.modeManager.mode !== 'game') {
      this.bufferedActions.length = 0;
      return;
    }

    while (this.bufferedActions.length > 0) {
      const action = this.bufferedActions.shift();
      if (!action) {
        continue;
      }

      const listeners = this.actionListeners.get(action);
      listeners?.forEach((listener) => listener());
    }

    if (this.camera) {
      this.currentMouseWorldPos = this.camera.screenToWorld(this.mouseScreenPos);
    }
  }

  public destroy(): void {
    this.canvas.removeEventListener('keydown', this.handleKeyDown);
    this.canvas.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('click', this.focusCanvas);
  }

  private focusCanvas = (): void => {
    this.canvas.focus();
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.modeManager.mode !== 'game') {
      return;
    }

    const key = event.key.toLowerCase();
    this.keyState.add(key);

    if (key === ' ') {
      this.bufferedActions.push('fire');
    }

    if (key === 'shift') {
      this.bufferedActions.push('boost');
    }

    if (key === 'escape') {
      this.bufferedActions.push('toggle-ui');
    }

  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keyState.delete(event.key.toLowerCase());
  };

  private handleMouseMove = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseScreenPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };
}
