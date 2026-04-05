type AudioChannel = 'music' | 'sfx' | 'ui';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private channelGains: Record<AudioChannel, GainNode | null> = {
    music: null,
    sfx: null,
    ui: null,
  };
  private muted = false;
  private musicElement: HTMLAudioElement | null = null;

  public async init(): Promise<void> {
    if (this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return;
    }

    const context = new AudioContext();
    const musicGain = context.createGain();
    const sfxGain = context.createGain();
    const uiGain = context.createGain();

    musicGain.connect(context.destination);
    sfxGain.connect(context.destination);
    uiGain.connect(context.destination);

    this.audioContext = context;
    this.channelGains = {
      music: musicGain,
      sfx: sfxGain,
      ui: uiGain,
    };

    await this.audioContext.resume();
  }

  public playMusic(url: string): void {
    this.stopMusic();

    const music = new Audio(url);
    music.loop = true;
    music.volume = this.muted ? 0 : this.channelGains.music?.gain.value ?? 1;
    this.musicElement = music;
    void music.play().catch(() => {
      /* ignored in stage 1 */
    });
  }

  public stopMusic(): void {
    if (!this.musicElement) {
      return;
    }

    this.musicElement.pause();
    this.musicElement.currentTime = 0;
    this.musicElement = null;
  }

  public playSfx(url: string): void {
    const sfx = new Audio(url);
    sfx.volume = this.muted ? 0 : this.channelGains.sfx?.gain.value ?? 1;
    void sfx.play().catch(() => {
      /* ignored in stage 1 */
    });
  }

  public playUiSound(url: string): void {
    const sound = new Audio(url);
    sound.volume = this.muted ? 0 : this.channelGains.ui?.gain.value ?? 1;
    void sound.play().catch(() => {
      /* ignored in stage 1 */
    });
  }

  public setVolume(channel: AudioChannel, value: number): void {
    const clamped = Math.min(1, Math.max(0, value));
    this.channelGains[channel]?.gain.setValueAtTime(
      clamped,
      this.audioContext?.currentTime ?? 0,
    );

    if (channel === 'music' && this.musicElement && !this.muted) {
      this.musicElement.volume = clamped;
    }
  }

  public mute(): void {
    this.muted = true;
    if (this.musicElement) {
      this.musicElement.volume = 0;
    }
  }

  public unmute(): void {
    this.muted = false;
    if (this.musicElement) {
      this.musicElement.volume = this.channelGains.music?.gain.value ?? 1;
    }
  }
}
