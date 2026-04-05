import type { Camera } from '@engine/renderer/Camera';
import type { SceneLayer } from './SceneLayer';

export class DebugLayer implements SceneLayer {
  public readonly order = 4;
  public enabled = true;

  public update(_dt: number, _camera: Camera): void {
    // No state yet.
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera, _alpha: number): void {
    if (!this.enabled) {
      return;
    }

    ctx.save();
    camera.applyTransform(ctx);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 1;

    const spacing = 100;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const halfWidth = width / 2 / camera.zoom;
    const halfHeight = height / 2 / camera.zoom;
    const startX = camera.position.x - halfWidth - spacing;
    const endX = camera.position.x + halfWidth + spacing;
    const startY = camera.position.y - halfHeight - spacing;
    const endY = camera.position.y + halfHeight + spacing;

    const firstVertical = Math.floor(startX / spacing) * spacing;
    const firstHorizontal = Math.floor(startY / spacing) * spacing;

    for (let x = firstVertical; x <= endX; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height / camera.zoom);
      ctx.stroke();
    }

    for (let y = firstHorizontal; y <= endY; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width / camera.zoom, y);
      ctx.stroke();
    }

    ctx.restore();
  }
}
