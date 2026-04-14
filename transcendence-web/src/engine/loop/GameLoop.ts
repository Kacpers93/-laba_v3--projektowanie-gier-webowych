import type { GameLoopConfig } from '@/types/engine';

const MIN_FRAME_TIME = 0.001;
const MAX_FRAME_TIME = 0.25;
const MAX_ACCUMULATED_TIME = 0.25;

export class GameLoop {
  private readonly tickDuration: number;
  private readonly config: GameLoopConfig;

  private frameId: number | null = null;
  private lastTimestamp = 0;
  private accumulator = 0;
  private running = false;
  private paused = false;

  public constructor(config: GameLoopConfig) {
    this.config = config;
    this.tickDuration = 1 / config.tickRate;
  }

  public get isPaused(): boolean {
    return this.paused;
  }

  public get isRunning(): boolean {
    return this.running;
  }

  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.paused = false;
    this.accumulator = 0;
    this.lastTimestamp = performance.now() / 1000;
    this.frameId = requestAnimationFrame(this.runFrame);
  }

  public stop(): void {
    this.running = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  public pause(): void {
    this.paused = true;
  }

  public resume(): void {
    this.paused = false;
    this.lastTimestamp = performance.now() / 1000;
  }

  private runFrame = (timestampMs: number): void => {
    if (!this.running) {
      return;
    }

    this.frameId = requestAnimationFrame(this.runFrame);

    if (this.paused) {
      return;
    }

    const timestamp = timestampMs / 1000;
    const rawFrameTime = timestamp - this.lastTimestamp;
    const frameTime = Math.min(MAX_FRAME_TIME, Math.max(MIN_FRAME_TIME, rawFrameTime));
    this.lastTimestamp = timestamp;

    this.accumulator += frameTime;
    if (this.accumulator > MAX_ACCUMULATED_TIME) {
      this.accumulator = MAX_ACCUMULATED_TIME;
    }

    while (this.accumulator >= this.tickDuration) {
      this.config.onFixedUpdate(this.tickDuration);
      this.accumulator -= this.tickDuration;
    }

    const alpha = this.accumulator / this.tickDuration;
    this.config.onFrameUpdate(frameTime, alpha);
    this.config.onFrameRender(alpha);
  };
}
