const DEFAULT_UPDATE_INTERVAL = 0.25;

export interface DevOverlayLike {
  mount(parent: HTMLElement): void;
  unmount(): void;
  toggle(): void;
  update(): void;
}

export class DevToolsFeatureModule {
  private overlay: DevOverlayLike | null = null;
  private overlayMounted = false;
  private mountRequested = false;
  private updateElapsed = 0;

  private readonly handleOverlayToggleKeydown = (event: KeyboardEvent): void => {
    if (!this.overlay || event.key !== '6') {
      return;
    }

    event.preventDefault();
    this.overlay.toggle();
  };

  public constructor(private readonly updateInterval = DEFAULT_UPDATE_INTERVAL) {
  }

  public attachOverlay(overlay: DevOverlayLike): void {
    this.overlay = overlay;
    this.mountIfRequested();
  }

  public requestMount(): void {
    this.mountRequested = true;
    this.mountIfRequested();
  }

  public requestUnmount(): void {
    this.mountRequested = false;
    this.unmountIfMounted();
  }

  public bindHotkeys(): void {
    window.addEventListener('keydown', this.handleOverlayToggleKeydown);
  }

  public unbindHotkeys(): void {
    window.removeEventListener('keydown', this.handleOverlayToggleKeydown);
  }

  public tick(dt: number): void {
    if (!this.overlay) {
      return;
    }

    this.updateElapsed += dt;
    if (this.updateElapsed < this.updateInterval) {
      return;
    }

    this.updateElapsed = 0;
    this.overlay.update();
  }

  private mountIfRequested(): void {
    if (!this.overlay || this.overlayMounted || !this.mountRequested) {
      return;
    }

    this.overlay.mount(document.body);
    this.overlayMounted = true;
  }

  private unmountIfMounted(): void {
    if (!this.overlay || !this.overlayMounted) {
      return;
    }

    this.overlay.unmount();
    this.overlayMounted = false;
  }
}

export function createDevToolsFeatureModule(updateInterval?: number): DevToolsFeatureModule {
  return new DevToolsFeatureModule(updateInterval);
}
