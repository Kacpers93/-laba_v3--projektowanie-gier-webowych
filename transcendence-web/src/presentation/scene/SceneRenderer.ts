import type { Camera } from '@engine/renderer/Camera';
import type { SceneLayer } from './SceneLayer';

export class SceneRenderer {
  private readonly layers: SceneLayer[] = [];

  public addLayer(layer: SceneLayer): void {
    this.layers.push(layer);
    this.layers.sort((left, right) => left.order - right.order);
  }

  public removeLayer(layer: SceneLayer): void {
    const index = this.layers.indexOf(layer);
    if (index >= 0) {
      this.layers.splice(index, 1);
    }
  }

  public update(dt: number, camera: Camera): void {
    for (const layer of this.layers) {
      layer.update(dt, camera);
    }
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera, alpha: number): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const layer of this.layers) {
      layer.render(ctx, camera, alpha);
    }
  }
}
