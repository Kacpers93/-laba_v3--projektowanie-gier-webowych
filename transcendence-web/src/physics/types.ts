import type { Vec2 } from './Vector2';

export interface AABB {
  min: Vec2;
  max: Vec2;
}

export interface CollisionResult {
  collided: boolean;
  normal: Vec2;
  depth: number;
}
