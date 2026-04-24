import type { Camera } from '@engine/renderer/Camera';
import type { OffscreenCache } from '@presentation/cache/OffscreenCache';
import type { SceneLayer } from '@presentation/scene/SceneLayer';

export interface ParallaxSublayerConfig {
  depthFactor: number;
  tileX: boolean;
  tileY: boolean;
  opacity: number;
  color: string;
  noiseIntensity: number;
  densityMultiplier: number;
  particleMinSize?: number;
  particleMaxSize?: number;
}

interface Sublayer {
  config: ParallaxSublayerConfig;
  cacheKey: string;
  offsetX: number;
  offsetY: number;
}

const PARALLAX_MAX_TEXTURE_WIDTH = 1600;
const PARALLAX_MAX_TEXTURE_HEIGHT = 900;

export class ParallaxLayer implements SceneLayer {
  readonly order = 1;
  private sublayers: Sublayer[] = [];

  public constructor(
    private cache: OffscreenCache,
    private width: number,
    private height: number,
    configs: ParallaxSublayerConfig[],
  ) {
    configs.forEach((cfg, idx) => {
      this.sublayers.push({
        config: cfg,
        cacheKey: `parallax-${idx}`,
        offsetX: 0,
        offsetY: 0,
      });
    });
  }

  public update(_dt: number, camera: Camera): void {
    this.sublayers.forEach((sublayer) => {
      sublayer.offsetX = camera.position.x * sublayer.config.depthFactor;
      sublayer.offsetY = camera.position.y * sublayer.config.depthFactor;
    });
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera, _alpha: number): void {
    const zoom = this.normalizeZoom(camera.zoom);
    const viewport = this.getViewportInLayerSpace(zoom);

    this.sublayers.forEach((sublayer) => {
      const textureDimensions = this.getTextureDimensions();
      const canvas = this.cache.getOrCreate(
        sublayer.cacheKey,
        textureDimensions.width,
        textureDimensions.height,
        (offscreenCtx) => {
          this.renderSublayerToCanvas(
            offscreenCtx,
            sublayer.config,
            textureDimensions.width,
            textureDimensions.height,
            sublayer.cacheKey,
          );
        },
      );

      const textureWidth = canvas.width;
      const textureHeight = canvas.height;
      const startX = sublayer.config.tileX
        ? viewport.minX - this.wrapOffset(viewport.minX + sublayer.offsetX, textureWidth)
        : -sublayer.offsetX;
      const startY = sublayer.config.tileY
        ? viewport.minY - this.wrapOffset(viewport.minY + sublayer.offsetY, textureHeight)
        : -sublayer.offsetY;
      const repeatX = sublayer.config.tileX ? Math.ceil(viewport.width / textureWidth) + 2 : 1;
      const repeatY = sublayer.config.tileY ? Math.ceil(viewport.height / textureHeight) + 2 : 1;

      ctx.save();
      this.applyZoomTransform(ctx, zoom);
      ctx.globalAlpha = sublayer.config.opacity;

      for (let x = 0; x < repeatX; x++) {
        for (let y = 0; y < repeatY; y++) {
          ctx.drawImage(canvas, startX + x * textureWidth, startY + y * textureHeight);
        }
      }

      ctx.restore();
    });
  }

  public regenerate(width: number, height: number): void {
    if (this.width === width && this.height === height) {
      return;
    }

    this.width = width;
    this.height = height;
    this.sublayers.forEach((s) => this.cache.invalidate(s.cacheKey));
  }

  private renderSublayerToCanvas(
    ctx: OffscreenCanvasRenderingContext2D,
    config: ParallaxSublayerConfig,
    width: number,
    height: number,
    seedKey: string,
  ): void {
    ctx.clearRect(0, 0, width, height);
    const rng = this.createDeterministicRng(seedKey);

    const area = width * height;
    const densityMultiplier = Math.max(0, config.densityMultiplier);
    const particleMinSize =
      typeof config.particleMinSize === 'number' ? Math.max(0.05, config.particleMinSize) : 0.9;
    const particleMaxSize =
      typeof config.particleMaxSize === 'number'
        ? Math.max(particleMinSize, config.particleMaxSize)
        : 4.3;
    const particleSizeRange = particleMaxSize - particleMinSize;

    const dustCount = Math.floor(
      (area / 900) * densityMultiplier * (0.8 + config.noiseIntensity),
    );
    for (let i = 0; i < dustCount; i++) {
      const x = rng() * width;
      const y = rng() * height;
      const size = particleMinSize + rng() * particleSizeRange;
      const alpha = Math.min(0.85, (rng() * 0.28 + 0.12) * config.noiseIntensity);

      ctx.fillStyle = this.withAlpha(config.color, alpha);

      for (const offsetX of [-width, 0, width]) {
        for (const offsetY of [-height, 0, height]) {
          const px = x + offsetX;
          const py = y + offsetY;
          if (px + size < 0 || px - size > width || py + size < 0 || py - size > height) {
            continue;
          }

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

  }

  private getTextureDimensions(): { width: number; height: number } {
    return {
      width: Math.max(1, Math.min(Math.floor(this.width), PARALLAX_MAX_TEXTURE_WIDTH)),
      height: Math.max(1, Math.min(Math.floor(this.height), PARALLAX_MAX_TEXTURE_HEIGHT)),
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

  private withAlpha(color: string, alpha: number): string {
    const match = color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/i);

    if (!match) {
      return color;
    }

    const red = Number(match[1]);
    const green = Number(match[2]);
    const blue = Number(match[3]);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  private createDeterministicRng(seedKey: string): () => number {
    let seed = this.hashString(seedKey);

    return () => {
      seed += 0x6d2b79f5;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private hashString(value: string): number {
    let hash = 2166136261;

    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }
}
