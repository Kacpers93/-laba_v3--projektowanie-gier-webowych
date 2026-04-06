import type { Camera } from '@engine/renderer/Camera';
import type { Renderable } from '@/types/engine';
import type { SceneLayer } from './SceneLayer';

export class WorldLayer implements SceneLayer {
  readonly order = 2;
  private renderables: Renderable[] = [];
  private _lastVisibleCount = 0;

  /** Dodaje renderable do warstwy. */
  public addRenderable(r: Renderable): void {
    this.renderables.push(r);
  }

  /** Usuwa renderable z warstwy. */
  public removeRenderable(entityId: string): void {
    this.renderables = this.renderables.filter((renderable) => renderable.entityId !== entityId);
  }

  public update(_dt: number, _camera: Camera): void {
    // Etap 3: miejsce na sorting lub przygotowanie danych pod culling.
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera, alpha: number): void {
    const viewportWidth = ctx.canvas.width;
    const viewportHeight = ctx.canvas.height;
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

      const screenPos = camera.worldToScreen(interpolatedPos);
      const cullRadius = renderable.cullRadius;

      const visible =
        screenPos.x + cullRadius > 0 &&
        screenPos.x - cullRadius < viewportWidth &&
        screenPos.y + cullRadius > 0 &&
        screenPos.y - cullRadius < viewportHeight;

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
