import type { Vector2 } from './common';

export interface GameLoopConfig {
  tickRate: number;
  onFixedUpdate: (dt: number) => void;
  onFrameUpdate: (dt: number, alpha: number) => void;
  onFrameRender: (alpha: number) => void;
}

export interface Renderable {
  position: Vector2;
  rotation: number;
  render(ctx: CanvasRenderingContext2D, alpha: number): void;
}
