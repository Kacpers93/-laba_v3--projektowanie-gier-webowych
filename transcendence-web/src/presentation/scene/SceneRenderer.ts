import type { Camera } from '@engine/renderer/Camera';
import type { SceneLayer } from './SceneLayer';

export class SceneRenderer {
  private layers: SceneLayer[] = [];

  public addLayer(layer: SceneLayer): void {
    this.layers.push(layer);
    this.layers.sort((a, b) => a.order - b.order);
  }

  public removeLayer(layer: SceneLayer): void {
    const idx = this.layers.indexOf(layer);
    if (idx >= 0) {
      this.layers.splice(idx, 1);
    }
  }

  public update(dt: number, camera: Camera): void {
    this.layers.forEach((layer) => layer.update(dt, camera));
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera, alpha: number): void {
    this.layers.forEach((layer) => layer.render(ctx, camera, alpha));
  }
}
