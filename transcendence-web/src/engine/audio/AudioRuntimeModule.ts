import { AudioManager } from './AudioManager';

export class AudioFeatureModule {
  private bound = false;
  private readonly handleFirstPointerDown = (): void => {
    void this.audioManager.init().then(() => {
      console.log(`[Audio] context state=${this.getAudioState()}`);
    });
  };

  public constructor(
    private readonly audioManager: AudioManager,
    private readonly getAudioState: () => string,
  ) {
  }

  public start(): void {
    if (this.bound) {
      return;
    }

    window.addEventListener('pointerdown', this.handleFirstPointerDown, { once: true });
    this.bound = true;
  }
}

export function createAudioFeatureModule(
  audioManager: AudioManager,
  getAudioState: () => string,
): AudioFeatureModule {
  return new AudioFeatureModule(audioManager, getAudioState);
}
