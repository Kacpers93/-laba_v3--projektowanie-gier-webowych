import type { Camera } from '@engine/renderer/Camera';
import type { OffscreenCache } from '@presentation/cache/OffscreenCache';
import type { SceneLayer } from '@presentation/scene/SceneLayer';

export interface BackgroundConfig {
  starCount: number;
  minBrightness: number;
  maxBrightness: number;
  minSize: number;
  maxSize: number;
  seed?: number;
  depthFactor?: number;
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
  private offsetX = 0;
  private offsetY = 0;

  public constructor(
    private cache: OffscreenCache,
    private width: number,
    private height: number,
    private config: BackgroundConfig,
  ) {
    this.generateStars();
  }

  public update(_dt: number, camera: Camera): void {
    const depthFactor = this.config.depthFactor ?? 0.02;
    this.offsetX = camera.position.x * depthFactor;
    this.offsetY = camera.position.y * depthFactor;
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera, _alpha: number): void {
    const cachedCanvas = this.cache.getOrCreate(
      this.cacheKey,
      this.width,
      this.height,
      (offscreenCtx) => {
        this.renderStarsToCanvas(offscreenCtx, this.width, this.height);
      },
    );

    const zoom = this.normalizeZoom(camera.zoom);
    const viewport = this.getViewportInLayerSpace(zoom);
    const textureWidth = cachedCanvas.width;
    const textureHeight = cachedCanvas.height;
    const startX = viewport.minX - this.wrapOffset(viewport.minX + this.offsetX, textureWidth);
    const startY = viewport.minY - this.wrapOffset(viewport.minY + this.offsetY, textureHeight);
    const repeatX = Math.ceil(viewport.width / textureWidth) + 2;
    const repeatY = Math.ceil(viewport.height / textureHeight) + 2;

    ctx.save();
    this.applyZoomTransform(ctx, zoom);

    for (let x = 0; x < repeatX; x++) {
      for (let y = 0; y < repeatY; y++) {
        ctx.drawImage(cachedCanvas, startX + x * textureWidth, startY + y * textureHeight);
      }
    }

    ctx.restore();
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

  private wrapOffset(offset: number, size: number): number {
    if (size <= 0) {
      return 0;
    }

    return ((offset % size) + size) % size;
  }

  private normalizeZoom(zoom: number): number {
    return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  }

  private getViewportInLayerSpace(zoom: number): {
    minX: number;
    minY: number;
    width: number;
    height: number;
  } {
    const viewportWidth = this.width / zoom;
    const viewportHeight = this.height / zoom;

    return {
      minX: (this.width - viewportWidth) / 2,
      minY: (this.height - viewportHeight) / 2,
      width: viewportWidth,
      height: viewportHeight,
    };
  }

  private applyZoomTransform(ctx: CanvasRenderingContext2D, zoom: number): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.translate(-centerX, -centerY);
  }
}
