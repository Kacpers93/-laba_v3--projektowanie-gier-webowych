import type { Renderable } from '@/types/engine';
import type { GameEntity } from '@entities/base/GameEntity';
import type { OffscreenCache } from '@presentation/cache/OffscreenCache';
import type { VisualProfile } from '@presentation/profiles/VisualProfile';
import { EntityRenderable } from './EntityRenderable';

/**
 * Tworzy Renderable na podstawie bytu i profilu wizualnego.
 * Centralne miejsce wiazania logiki z prezentacja.
 */
export class RenderableFactory {
  public constructor(private readonly cache: OffscreenCache) {}

  /**
   * Tworzy Renderable dla danego bytu.
   * Uzywa profilu do okreslenia, jak obiekt wyglada.
   */
  public create(entity: GameEntity, profile: VisualProfile): Renderable {
    const renderable = new EntityRenderable(entity.id, profile, this.cache);
    renderable.syncFromEntity(entity);
    return renderable;
  }
}