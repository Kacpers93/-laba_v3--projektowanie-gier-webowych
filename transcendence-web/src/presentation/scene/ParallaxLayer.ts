import type { Camera } from '@engine/renderer/Camera';
import type { OffscreenCache } from '../cache/OffscreenCache';
import type { SceneLayer } from './SceneLayer';

export interface ParallaxSublayerConfig {
  depthFactor: number;
  tileX: boolean;
  tileY: boolean;
  opacity: number;
  color: string;
  noiseIntensity: number;
}

interface Sublayer {
  config: ParallaxSublayerConfig;
  cacheKey: string;
  offsetX: number;
  offsetY: number;
}

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

  public render(ctx: CanvasRenderingContext2D, _camera: Camera, _alpha: number): void {
    this.sublayers.forEach((sublayer) => {
      const canvas = this.cache.getOrCreate(
        sublayer.cacheKey,
        this.width,
        this.height,
        (offscreenCtx) => {
          this.renderSublayerToCanvas(offscreenCtx, sublayer.config, this.width, this.height);
        },
      );

      const textureWidth = canvas.width;
      const textureHeight = canvas.height;
      const startX = sublayer.config.tileX
        ? -this.wrapOffset(sublayer.offsetX, textureWidth)
        : -sublayer.offsetX;
      const startY = sublayer.config.tileY
        ? -this.wrapOffset(sublayer.offsetY, textureHeight)
        : -sublayer.offsetY;
      const repeatX = sublayer.config.tileX ? Math.ceil(this.width / textureWidth) + 1 : 1;
      const repeatY = sublayer.config.tileY ? Math.ceil(this.height / textureHeight) + 1 : 1;

      ctx.save();
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
    this.width = width;
    this.height = height;
    this.sublayers.forEach((s) => this.cache.invalidate(s.cacheKey));
  }

  private renderSublayerToCanvas(
    ctx: OffscreenCanvasRenderingContext2D,
    config: ParallaxSublayerConfig,
    width: number,
    height: number,
  ): void {
    ctx.clearRect(0, 0, width, height);

    const dustCount = Math.floor((width * height) / 900 * (0.8 + config.noiseIntensity));
    for (let i = 0; i < dustCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3.4 + 0.9;
      const alpha = Math.min(0.85, (Math.random() * 0.28 + 0.12) * config.noiseIntensity);

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

    const wispCount = Math.floor((width * height) / 120000 * (0.6 + config.noiseIntensity));
    for (let i = 0; i < wispCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radiusX = Math.random() * 20 + 10;
      const radiusY = Math.random() * 8 + 4;
      const rotation = Math.random() * Math.PI;
      const alpha = Math.min(0.45, (Math.random() * 0.16 + 0.06) * config.noiseIntensity);

      ctx.fillStyle = this.withAlpha(config.color, alpha);

      for (const offsetX of [-width, 0, width]) {
        for (const offsetY of [-height, 0, height]) {
          const px = x + offsetX;
          const py = y + offsetY;
          if (
            px + radiusX < 0 ||
            px - radiusX > width ||
            py + radiusX < 0 ||
            py - radiusX > height
          ) {
            continue;
          }

          ctx.beginPath();
          ctx.ellipse(px, py, radiusX, radiusY, rotation, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

  }

  private wrapOffset(offset: number, size: number): number {
    if (size <= 0) {
      return 0;
    }

    return ((offset % size) + size) % size;
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
}
