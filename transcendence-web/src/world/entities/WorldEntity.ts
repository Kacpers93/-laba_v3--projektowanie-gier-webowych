import type { Vector2 } from '@/types/common';
import { BaseEntity } from '@entities/base/BaseEntity';
import type { EntityCategory } from '@entities/base/EntityCategory';
import { Vec2 } from '@physics/Vector2';
import type { AABB } from '@physics/types';
import type { RuntimeSeedObjectType } from '../seed/seedTypes';

/**
 * Wspolna klasa bazowa dla wszystkich bytow tworzonych z seeda systemu.
 * Obiekty statyczne nie maja update().
 */
export class WorldEntity extends BaseEntity {
  public readonly boundingBox: AABB;
  public readonly computedHeight: number;
  public readonly seedType: RuntimeSeedObjectType;
  public readonly isStatic: boolean;
  public readonly profileId: string;
  /**
   * Czy obiekt przyjmuje dokowanie gracza (klawisz E).
   * Domyslnie false; stacje i wraki ustawiaja true po zaladowaniu seeda.
   */
  public dockable: boolean;

  public constructor(config: {
    id: string;
    category: EntityCategory;
    seedType: RuntimeSeedObjectType;
    position: Vector2;
    width: number;
    height: number;
    computedHeight: number;
    isStatic: boolean;
    profileId: string;
    dockable?: boolean;
  }) {
    super(config.id, config.category, config.position);
    this.seedType = config.seedType;
    this.computedHeight = config.computedHeight;
    this.isStatic = config.isStatic;
    this.profileId = config.profileId;
    this.dockable = config.dockable ?? false;
    this.boundingBox = {
      min: new Vec2(-config.width / 2, -config.height / 2),
      max: new Vec2(config.width / 2, config.height / 2),
    };
  }
}
