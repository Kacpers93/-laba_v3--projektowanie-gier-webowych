import type { EntityId, Vector2 } from '@/types/common';
import type { AABB } from '@physics/types';
import type { EntityCategory } from './EntityCategory';
import type { GameEntity } from './GameEntity';

/** Abstrakcyjna klasa bazowa — domyslna implementacja GameEntity. */
export abstract class BaseEntity implements GameEntity {
  public position: Vector2;
  public previousPosition: Vector2;
  public velocity: Vector2 = { x: 0, y: 0 };
  public rotation = 0;
  public previousRotation = 0;
  public abstract readonly boundingBox: AABB;

  protected alive = true;

  public constructor(
    public readonly id: EntityId,
    public readonly category: EntityCategory,
    startPosition: Vector2,
  ) {
    this.position = { ...startPosition };
    this.previousPosition = { ...startPosition };
  }

  public isAlive(): boolean {
    return this.alive;
  }

  /** Wywolywane przed kazdym tickiem logiki — zapisuje stan do interpolacji. */
  public savePreviousState(): void {
    this.previousPosition = { ...this.position };
    this.previousRotation = this.rotation;
  }
}