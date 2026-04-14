import type { EntityId, Vector2 } from '@/types/common';
import type { Renderable } from '@/types/engine';
import type { AssetLoader } from '@assets/AssetLoader';
import type { OffscreenCache } from '@presentation/cache/OffscreenCache';
import type { VisualProfile } from '@presentation/profiles/VisualProfile';

/**
 * Domyslna implementacja Renderable dla bytow swiata.
 * Obsluguje interpolacje, culling i deleguje rysowanie do VisualProfile.
 */
export class EntityRenderable implements Renderable {
  public static pixelSnapStatic = true;

  public position: Vector2;
  public previousPosition: Vector2;
  public rotation = 0;
  public previousRotation = 0;
  public readonly cullRadius: number;
  public computedHeight: number;
  public visible = true;

  public constructor(
    public readonly entityId: EntityId,
    private readonly profile: VisualProfile,
    private readonly cache: OffscreenCache,
    private readonly assetLoader?: AssetLoader,
    computedHeight: number = 0,
    private readonly isStaticRenderable: boolean = false,
  ) {
    this.position = { x: 0, y: 0 };
    this.previousPosition = { x: 0, y: 0 };
    this.cullRadius = profile.cullRadius;
    this.computedHeight = computedHeight;
  }

  /** Interpoluje pozycje i rotacje. */
  public getInterpolatedPosition(alpha: number): Vector2 {
    return {
      x: this.previousPosition.x + (this.position.x - this.previousPosition.x) * alpha,
      y: this.previousPosition.y + (this.position.y - this.previousPosition.y) * alpha,
    };
  }

  public getInterpolatedRotation(alpha: number): number {
    return this.previousRotation + (this.rotation - this.previousRotation) * alpha;
  }

  /** Synchronizuje pozycje i rotacje z bytu logicznego. */
  public syncFromEntity(entity: {
    position: Vector2;
    previousPosition: Vector2;
    rotation: number;
    previousRotation: number;
    computedHeight?: number;
  }): void {
    this.position = { ...entity.position };
    this.previousPosition = { ...entity.previousPosition };
    this.rotation = entity.rotation;
    this.previousRotation = entity.previousRotation;
    if (typeof entity.computedHeight === 'number') {
      this.computedHeight = entity.computedHeight;
    }
  }

  /** Rysuje obiekt — deleguje do profilu. */
  public render(ctx: CanvasRenderingContext2D, alpha: number): void {
    if (!this.visible) {
      return;
    }

    const position = this.getInterpolatedPosition(alpha);
    const renderPosition =
      this.isStaticRenderable && EntityRenderable.pixelSnapStatic
        ? {
            x: Math.round(position.x),
            y: Math.round(position.y),
          }
        : position;
    const rotation = this.getInterpolatedRotation(alpha);

    ctx.save();
    ctx.translate(renderPosition.x, renderPosition.y);
    ctx.rotate(rotation);

    const source = this.profile.source;

    if (source.type === 'procedural') {
      const { width, height } = this.profile.size;
      const key = `entity-${this.entityId}-${this.profile.profileId}`;
      const sprite = this.cache.getOrCreate(key, width, height, (offscreenCtx) => {
        offscreenCtx.save();
        offscreenCtx.clearRect(0, 0, width, height);
        offscreenCtx.translate(width / 2, height / 2);
        source.drawFn(offscreenCtx, width, height);
        offscreenCtx.restore();
      });

      ctx.drawImage(sprite, -width / 2, -height / 2);
    } else if (source.type === 'sprite') {
      const image = this.assetLoader?.getImage(this.profile.profileId) ?? null;

      if (!image) {
        this.renderFallback(ctx);
      } else {
        const { width, height } = this.profile.size;
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
      }
    }

    ctx.restore();
  }

  private renderFallback(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.profile.size;
    ctx.fillStyle = '#ff2244';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.profile.category.toUpperCase(), 0, 0);
  }
}