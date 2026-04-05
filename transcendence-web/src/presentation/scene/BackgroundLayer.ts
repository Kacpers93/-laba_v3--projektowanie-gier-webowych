import type { Camera } from '@engine/renderer/Camera';
import type { SceneLayer } from './SceneLayer';
import { OffscreenCache } from '../cache/OffscreenCache';

type BackgroundConfig = {
  starCount?: number;
  minBrightness?: number;
  maxBrightness?: number;
  minSize?: number;
  maxSize?: number;
  seed?: number;
};

type Star = {
  x: number;
  y: number;
  size: number;
  brightness: number;
};

export class BackgroundLayer implements SceneLayer {
  public readonly order = 0;

  private readonly starCount: number;
  private readonly minBrightness: number;
  private readonly maxBrightness: number;
  private readonly minSize: number;
  private readonly maxSize: number;
  private readonly seed: number;

  private width = 1;
  private height = 1;
  private stars: Star[] = [];

  public constructor(
    private readonly cache: OffscreenCache,
    config: BackgroundConfig = {},
  ) {
    this.starCount = config.starCount ?? 400;
    this.minBrightness = config.minBrightness ?? 0.3;
    this.maxBrightness = config.maxBrightness ?? 1;
    this.minSize = config.minSize ?? 0.5;
    this.maxSize = config.maxSize ?? 2;
    this.seed = config.seed ?? 1337;
  }

  public update(_dt: number, _camera: Camera): void {
    // static layer
  }

  public render(ctx: CanvasRenderingContext2D, _camera: Camera, _alpha: number): void {
    const canvas = this.cache.getOrCreate('background', this.width, this.height, (offscreenCtx) => {
      this.renderBackground(offscreenCtx);
    });

    ctx.drawImage(canvas, 0, 0);
  }

  public regenerate(width: number, height: number): void {
    this.width = Math.max(1, Math.floor(width));
    this.height = Math.max(1, Math.floor(height));
    this.stars = this.generateStars(this.width, this.height);
    this.cache.invalidate('background');
  }

  private renderBackground(ctx: OffscreenCanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    for (const star of this.stars) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness.toFixed(3)})`;
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private generateStars(width: number, height: number): Star[] {
    const random = this.createRandom(this.seed + width * 31 + height * 17);
    const stars: Star[] = [];

    for (let index = 0; index < this.starCount; index += 1) {
      stars.push({
        x: random() * width,
        y: random() * height,
        size: this.minSize + random() * (this.maxSize - this.minSize),
        brightness: this.minBrightness + random() * (this.maxBrightness - this.minBrightness),
      });
    }

    return stars;
  }

  private createRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0xffffffff;
    };
  }
}
