import type { Camera } from '@engine/renderer/Camera';

export interface SceneLayer {
  readonly order: number;
  update(dt: number, camera: Camera): void;
  render(ctx: CanvasRenderingContext2D, camera: Camera, alpha: number): void;
}
