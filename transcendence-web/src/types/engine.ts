import type { Vector2 } from './common';
import type { EntityId } from './common';

export interface GameLoopConfig {
  tickRate: number;
  onFixedUpdate: (dt: number) => void;
  onFrameUpdate: (dt: number, alpha: number) => void;
  onFrameRender: (alpha: number) => void;
}

export interface Renderable {
  readonly entityId: EntityId;
  position: Vector2;
  previousPosition: Vector2;
  rotation: number;
  previousRotation: number;
  readonly cullRadius: number;
  /** Porzadek rysowania - mniejszy = rysowany wczesniej (pod spodem). */
  computedHeight: number;
  visible: boolean;
  render(ctx: CanvasRenderingContext2D, alpha: number): void;
}
