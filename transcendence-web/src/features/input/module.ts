import { Camera } from '@engine/renderer/Camera';
import { GameInput } from '@engine/input/GameInput';
import { InputModeManager } from '@engine/input/InputModeManager';
import { UIInput } from '@engine/input/UIInput';

export interface InputFeatureHooks {
  onToggleUi: () => void;
  onCancelUi: () => void;
}

export class InputFeatureModule {
  private gameInput: GameInput | null = null;
  private uiInput: UIInput | null = null;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly inputModeManager: InputModeManager,
    private readonly camera: Camera,
  ) {
  }

  public start(hooks: InputFeatureHooks): { gameInput: GameInput; uiInput: UIInput } {
    if (this.gameInput && this.uiInput) {
      return { gameInput: this.gameInput, uiInput: this.uiInput };
    }

    this.gameInput = new GameInput(this.canvas, this.inputModeManager);
    this.uiInput = new UIInput(this.inputModeManager);
    this.gameInput.setCamera(this.camera);

    this.gameInput.onAction('toggle-ui', hooks.onToggleUi);
    this.uiInput.onCancel(hooks.onCancelUi);

    return { gameInput: this.gameInput, uiInput: this.uiInput };
  }

  public dispose(): void {
    this.gameInput?.destroy();
    this.uiInput?.destroy();
    this.gameInput = null;
    this.uiInput = null;
  }

  public get isActive(): boolean {
    return this.gameInput !== null && this.uiInput !== null;
  }
}

export function createInputFeatureModule(
  canvas: HTMLCanvasElement,
  inputModeManager: InputModeManager,
  camera: Camera,
): InputFeatureModule {
  return new InputFeatureModule(canvas, inputModeManager, camera);
}
