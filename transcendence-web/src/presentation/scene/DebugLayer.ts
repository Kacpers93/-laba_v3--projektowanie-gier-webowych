import type { Camera } from '@engine/renderer/Camera';
import type { SceneLayer } from './SceneLayer';

const GRID_SIZE = 100;

export class DebugLayer implements SceneLayer {
  readonly order = 99;
  private enabled = false;

  public constructor() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'g' || e.key === 'G') {
        this.enabled = !this.enabled;
      }
    });
  }

  public update(_dt: number, _camera: Camera): void {
    // Nic do roboty
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera, _alpha: number): void {
    if (!this.enabled) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.lineWidth = 1;

    // Siatka świata
    const gridStartX = Math.floor(camera.position.x / GRID_SIZE) * GRID_SIZE;
    const gridStartY = Math.floor(camera.position.y / GRID_SIZE) * GRID_SIZE;

    const screenWidth = ctx.canvas.width;
    const screenHeight = ctx.canvas.height;

    for (let x = gridStartX - GRID_SIZE; x < gridStartX + screenWidth / camera.zoom + GRID_SIZE; x += GRID_SIZE) {
      const screenX = (x - camera.position.x) * camera.zoom + screenWidth / 2;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, screenHeight);
      ctx.stroke();
    }

    for (let y = gridStartY - GRID_SIZE; y < gridStartY + screenHeight / camera.zoom + GRID_SIZE; y += GRID_SIZE) {
      const screenY = (y - camera.position.y) * camera.zoom + screenHeight / 2;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(screenWidth, screenY);
      ctx.stroke();
    }

    // Sygnalizator kamery
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(screenWidth / 2 - 5, screenHeight / 2 - 5, 10, 10);

    ctx.restore();
  }
}
