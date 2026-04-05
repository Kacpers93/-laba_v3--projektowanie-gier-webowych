import type { Camera } from '@engine/renderer/Camera';
import type { OffscreenCache } from '../cache/OffscreenCache';
import type { SceneLayer } from './SceneLayer';

export interface BackgroundConfig {
  starCount: number;
  minBrightness: number;
  maxBrightness: number;
  minSize: number;
  maxSize: number;
  seed?: number;
}

interface Star {
  x: number;
  y: number;
  brightness: number;
  size: number;
}

export class BackgroundLayer implements SceneLayer {
  readonly order = 0;
  private stars: Star[] = [];
  private cacheKey = 'background';

  public constructor(
    private cache: OffscreenCache,
    private width: number,
    private height: number,
    private config: BackgroundConfig,
  ) {
    this.generateStars();
  }

  public update(_dt: number, _camera: Camera): void {
    // Nic do roboty — tło jest statyczne
  }

  public render(ctx: CanvasRenderingContext2D, _camera: Camera, _alpha: number): void {
    const cachedCanvas = this.cache.getOrCreate(
      this.cacheKey,
      this.width,
      this.height,
      (offscreenCtx) => {
        this.renderStarsToCanvas(offscreenCtx, this.width, this.height);
      },
    );

    ctx.drawImage(cachedCanvas, 0, 0);
  }

  public regenerate(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.generateStars();
    this.cache.invalidate(this.cacheKey);
  }

  private generateStars(): void {
    this.stars = [];
    const seed = this.config.seed ?? Math.random() * 10000;
    const rng = this.seededRandom(seed);

    for (let i = 0; i < this.config.starCount; i++) {
      this.stars.push({
        x: rng() * this.width,
        y: rng() * this.height,
        brightness: this.config.minBrightness + rng() * (this.config.maxBrightness - this.config.minBrightness),
        size: this.config.minSize + rng() * (this.config.maxSize - this.config.minSize),
      });
    }
  }

  private renderStarsToCanvas(
    ctx: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    this.stars.forEach((star) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private seededRandom(seed: number) {
    let m_w = seed;
    let m_z = 987654321;
    return () => {
      m_z = (36969 * (m_z & 65535) + (m_z >>> 16)) >>> 0;
      m_w = (18000 * (m_w & 65535) + (m_w >>> 16)) >>> 0;
      let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
      result /= 4294967296;
      return result;
    };
  }
}
