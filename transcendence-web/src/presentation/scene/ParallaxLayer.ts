import type { Camera } from '@engine/renderer/Camera';
import type { SceneLayer } from './SceneLayer';
import { OffscreenCache } from '../cache/OffscreenCache';

type ParallaxSublayerConfig = {
  depthFactor: number;
  tileX: boolean;
  tileY: boolean;
  opacity: number;
  color: string;
  seed?: number;
  textureWidth?: number;
  textureHeight?: number;
};

type InternalSublayer = ParallaxSublayerConfig & {
  texture: OffscreenCanvas;
  offsetX: number;
  offsetY: number;
};

export class ParallaxLayer implements SceneLayer {
  public readonly order = 1;

  private readonly sublayers: InternalSublayer[];
  private width = 1;
  private height = 1;

  public constructor(
    private readonly cache: OffscreenCache,
    sublayers: ParallaxSublayerConfig[],
  ) {
    this.sublayers = sublayers.map((sublayer, index) => {
      const textureWidth = sublayer.textureWidth ?? 640;
      const textureHeight = sublayer.textureHeight ?? 360;
      const textureKey = `parallax-${index}`;
      const texture = this.cache.getOrCreate(textureKey, textureWidth, textureHeight, (ctx) => {
        this.renderTexture(ctx, textureWidth, textureHeight, sublayer.color, sublayer.seed ?? index + 1);
      });

      return {
        ...sublayer,
        texture,
        offsetX: 0,
        offsetY: 0,
      };
    });
  }

  public update(_dt: number, camera: Camera): void {
    for (const sublayer of this.sublayers) {
      sublayer.offsetX = camera.position.x * sublayer.depthFactor;
      sublayer.offsetY = camera.position.y * sublayer.depthFactor;
    }
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera, _alpha: number): void {
    for (const sublayer of this.sublayers) {
      this.renderSublayer(ctx, camera, sublayer);
    }
  }

  public regenerate(width: number, height: number): void {
    this.width = Math.max(1, Math.floor(width));
    this.height = Math.max(1, Math.floor(height));
  }

  private renderSublayer(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    sublayer: InternalSublayer,
  ): void {
    ctx.save();
    ctx.globalAlpha = sublayer.opacity;

    const offsetX = -(sublayer.offsetX % sublayer.texture.width);
    const offsetY = -(sublayer.offsetY % sublayer.texture.height);
    const tileWidth = sublayer.texture.width;
    const tileHeight = sublayer.texture.height;

    const startX = sublayer.tileX ? offsetX - tileWidth : offsetX;
    const endX = sublayer.tileX ? this.width + tileWidth : this.width;
    const startY = sublayer.tileY ? offsetY - tileHeight : offsetY;
    const endY = sublayer.tileY ? this.height + tileHeight : this.height;

    for (let x = startX; x < endX; x += tileWidth) {
      for (let y = startY; y < endY; y += tileHeight) {
        ctx.drawImage(sublayer.texture, x, y);
      }
      if (!sublayer.tileY) {
        break;
      }
    }

    if (!sublayer.tileX && !sublayer.tileY) {
      ctx.drawImage(sublayer.texture, offsetX, offsetY);
    }

    ctx.restore();
  }

  private renderTexture(
    ctx: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    color: string,
    seed: number,
  ): void {
    const random = this.createRandom(seed + width * 13 + height * 7);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    for (let index = 0; index < 24; index += 1) {
      const x = random() * width;
      const y = random() * height;
      const radius = 80 + random() * 180;
      const alpha = 0.05 + random() * 0.08;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, this.withAlpha(color, alpha));
      gradient.addColorStop(1, this.withAlpha(color, 0));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private createRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
      state = (1103515245 * state + 12345) >>> 0;
      return state / 0xffffffff;
    };
  }

  private withAlpha(color: string, alpha: number): string {
    if (color.startsWith('rgba(')) {
      return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${alpha})`);
    }

    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }

    return color;
  }
}
