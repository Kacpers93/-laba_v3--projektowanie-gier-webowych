import type { Camera } from '@engine/renderer/Camera';
import type { SceneLayer } from './SceneLayer';

export class WorldLayer implements SceneLayer {
  public readonly order = 2;

  public update(_dt: number, _camera: Camera): void {
    // Etap 2: placeholder only.
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera, _alpha: number): void {
    ctx.save();
    camera.applyTransform(ctx);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 20);
    ctx.stroke();
    ctx.restore();
  }
}
