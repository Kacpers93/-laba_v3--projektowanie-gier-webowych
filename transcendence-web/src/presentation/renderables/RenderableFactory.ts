import type { Renderable } from '@/types/engine';
import type { AssetLoader } from '@assets/AssetLoader';
import type { GameEntity } from '@entities/base/GameEntity';
import type { OffscreenCache } from '@presentation/cache/OffscreenCache';
import type { VisualProfile } from '@presentation/profiles/VisualProfile';
import { EntityRenderable } from './EntityRenderable';

type HeightAwareEntity = GameEntity & { computedHeight?: number };
type StaticAwareEntity = GameEntity & { isStatic?: boolean };

/**
 * Tworzy Renderable na podstawie bytu i profilu wizualnego.
 * Centralne miejsce wiazania logiki z prezentacja.
 */
export class RenderableFactory {
  public constructor(
    private readonly cache: OffscreenCache,
    private readonly assetLoader?: AssetLoader,
  ) {}

  /**
   * Tworzy Renderable dla danego bytu.
   * Uzywa profilu do okreslenia, jak obiekt wyglada.
   */
  public create(entity: GameEntity, profile: VisualProfile): Renderable {
    const source = entity as HeightAwareEntity;
    const staticSource = entity as StaticAwareEntity;
    const computedHeight =
      typeof source.computedHeight === 'number' ? source.computedHeight : 0;
    const isStaticRenderable = staticSource.isStatic === true;

    const renderable = new EntityRenderable(
      entity.id,
      profile,
      this.cache,
      this.assetLoader,
      computedHeight,
      isStaticRenderable,
    );
    renderable.syncFromEntity(entity);
    return renderable;
  }
}