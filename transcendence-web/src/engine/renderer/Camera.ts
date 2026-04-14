import type { Vector2 } from '@/types/common';

export class Camera {
  public position: Vector2 = { x: 0, y: 0 };
  public zoom = 1;
  private renderScale = 1;

  public constructor(
    private viewportWidth: number,
    private viewportHeight: number,
  ) {}

  public setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  public get width(): number {
    return this.viewportWidth;
  }

  public get height(): number {
    return this.viewportHeight;
  }

  public setRenderScale(scale: number): void {
    this.renderScale = scale > 0 ? scale : 1;
  }

  public follow(target: Vector2): void {
    this.position = { x: target.x, y: target.y };
  }

  public worldToScreen(point: Vector2): Vector2 {
    return {
      x: (point.x - this.position.x) * this.zoom + this.viewportWidth / 2,
      y: (point.y - this.position.y) * this.zoom + this.viewportHeight / 2,
    };
  }

  public screenToWorld(point: Vector2): Vector2 {
    return {
      x: (point.x - this.viewportWidth / 2) / this.zoom + this.position.x,
      y: (point.y - this.viewportHeight / 2) / this.zoom + this.position.y,
    };
  }

  public applyTransform(ctx: CanvasRenderingContext2D): void {
    const scaledZoom = this.zoom * this.renderScale;

    ctx.setTransform(
      scaledZoom,
      0,
      0,
      scaledZoom,
      (this.viewportWidth / 2 - this.position.x * this.zoom) * this.renderScale,
      (this.viewportHeight / 2 - this.position.y * this.zoom) * this.renderScale,
    );
  }
}
