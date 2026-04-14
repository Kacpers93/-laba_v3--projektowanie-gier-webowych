import type { Camera } from '@engine/renderer/Camera';
import type { Renderable } from '@/types/engine';
import type { SceneLayer } from './SceneLayer';

export class WorldLayer implements SceneLayer {
  readonly order = 2;
  private renderables: Renderable[] = [];
  private _lastVisibleCount = 0;
  private renderOrderDirty = true;

  /** Dodaje renderable do warstwy. */
  public addRenderable(r: Renderable): void {
    this.renderables.push(r);
    this.renderOrderDirty = true;
  }

  /** Usuwa renderable z warstwy. */
  public removeRenderable(entityId: string): void {
    const prevLength = this.renderables.length;
    this.renderables = this.renderables.filter((renderable) => renderable.entityId !== entityId);
    if (this.renderables.length !== prevLength) {
      this.renderOrderDirty = true;
    }
  }

  public markRenderOrderDirty(): void {
    this.renderOrderDirty = true;
  }

  public update(_dt: number, _camera: Camera): void {
    if (!this.renderOrderDirty) {
      return;
    }

    this.renderables.sort((a, b) => a.computedHeight - b.computedHeight);
    this.renderOrderDirty = false;
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera, alpha: number): void {
    const halfWorldWidth = camera.width / (2 * camera.zoom);
    const halfWorldHeight = camera.height / (2 * camera.zoom);
    const minWorldX = camera.position.x - halfWorldWidth;
    const maxWorldX = camera.position.x + halfWorldWidth;
    const minWorldY = camera.position.y - halfWorldHeight;
    const maxWorldY = camera.position.y + halfWorldHeight;
    let visibleCount = 0;

    camera.applyTransform(ctx);

    this.renderables.forEach((renderable) => {
      if (!renderable.visible) {
        return;
      }

      const interpolatedPos = {
        x:
          renderable.previousPosition.x +
          (renderable.position.x - renderable.previousPosition.x) * alpha,
        y:
          renderable.previousPosition.y +
          (renderable.position.y - renderable.previousPosition.y) * alpha,
      };

      const cullRadius = renderable.cullRadius;

      const visible =
        interpolatedPos.x + cullRadius > minWorldX &&
        interpolatedPos.x - cullRadius < maxWorldX &&
        interpolatedPos.y + cullRadius > minWorldY &&
        interpolatedPos.y - cullRadius < maxWorldY;

      if (!visible) {
        return;
      }

      visibleCount += 1;
      renderable.render(ctx, alpha);
    });

    this._lastVisibleCount = visibleCount;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /** Laczna liczba zarejestrowanych renderables. */
  public get renderableCount(): number {
    return this.renderables.length;
  }

  /** Ile renderables bylo widocznych w ostatniej klatce render(). */
  public get lastVisibleCount(): number {
    return this._lastVisibleCount;
  }

  /** Ile renderables bylo culled w ostatniej klatce. */
  public get lastCulledCount(): number {
    return this.renderables.length - this._lastVisibleCount;
  }
}
