import { InputModeManager } from '@engine/input/InputModeManager';
import { HudController } from '@ui/hud/HudController';
import { MenuController } from '@ui/menu/MenuController';
import { MenuView } from '@ui/menu/MenuView';

export interface UiFeatureHooks {
  getPlayerLabel: () => string;
  tryDockNearestEntity: () => void;
}

export class UiFeatureModule {
  private menuKeysBound = false;

  private readonly handleMenuKeyDown = (event: KeyboardEvent): void => {
    if (this.menuController.isMenuOpen) {
      return;
    }

    if (this.inputModeManager.mode !== 'game') {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.menuController.openGameMenu();
      return;
    }

    if (event.key === 'b' || event.key === 'B') {
      event.preventDefault();
      this.menuController.openPlayerShipMenu(this.hooks.getPlayerLabel());
      return;
    }

    if (event.key === 'e' || event.key === 'E') {
      event.preventDefault();
      this.hooks.tryDockNearestEntity();
    }
  };

  public constructor(
    private readonly hudController: HudController,
    private readonly menuController: MenuController,
    private readonly menuView: MenuView,
    private readonly hudLayer: HTMLDivElement,
    private readonly screenLayer: HTMLDivElement,
    private readonly inputModeManager: InputModeManager,
    private readonly hooks: UiFeatureHooks,
  ) {
  }

  public start(): void {
    this.hudController.mount(this.hudLayer);
    this.menuView.mount(this.screenLayer, {
      onSelect: () => { /* obsluzone przez MenuController */ },
      onBack: () => { /* obsluzone przez MenuController */ },
      onClose: () => { this.menuController.close(); },
    });

    if (!this.menuKeysBound) {
      window.addEventListener('keydown', this.handleMenuKeyDown);
      this.menuKeysBound = true;
    }
  }

  public stop(): void {
    this.hudController.unmount();
    this.menuView.unmount();

    if (this.menuKeysBound) {
      window.removeEventListener('keydown', this.handleMenuKeyDown);
      this.menuKeysBound = false;
    }
  }
}

export function createUiFeatureModule(
  hudController: HudController,
  menuController: MenuController,
  menuView: MenuView,
  hudLayer: HTMLDivElement,
  screenLayer: HTMLDivElement,
  inputModeManager: InputModeManager,
  hooks: UiFeatureHooks,
): UiFeatureModule {
  return new UiFeatureModule(
    hudController,
    menuController,
    menuView,
    hudLayer,
    screenLayer,
    inputModeManager,
    hooks,
  );
}
