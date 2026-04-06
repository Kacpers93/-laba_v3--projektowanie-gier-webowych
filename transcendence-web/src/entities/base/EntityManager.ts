import type { EntityId } from '@/types/common';
import type { EntityCategory } from './EntityCategory';
import type { GameEntity } from './GameEntity';

/**
 * Rejestr aktywnych bytow. Jeden na aktywny system gwiezdny.
 * Nie zawiera logiki aktualizacji — to rola systems/.
 */
export class EntityManager {
  private readonly entities = new Map<EntityId, GameEntity>();

  /** Dodaje byt do rejestru. */
  public add(entity: GameEntity): void {
    this.entities.set(entity.id, entity);
  }

  /** Usuwa byt z rejestru (po zniszczeniu / opuszczeniu systemu). */
  public remove(id: EntityId): void {
    this.entities.delete(id);
  }

  /** Pobiera byt po id. */
  public get(id: EntityId): GameEntity | undefined {
    return this.entities.get(id);
  }

  /** Czy byt o danym id istnieje. */
  public has(id: EntityId): boolean {
    return this.entities.has(id);
  }

  /** Wszystkie aktywne byty. */
  public getAll(): ReadonlyArray<GameEntity> {
    return Array.from(this.entities.values());
  }

  /** Byty danej kategorii. */
  public getByCategory(category: EntityCategory): ReadonlyArray<GameEntity> {
    return Array.from(this.entities.values()).filter((entity) => entity.category === category);
  }

  /** Usuwa byty, dla ktorych isAlive() === false. */
  public sweepDead(): void {
    this.entities.forEach((entity, id) => {
      if (!entity.isAlive()) {
        this.entities.delete(id);
      }
    });
  }

  /** Liczba aktywnych bytow. */
  public get size(): number {
    return this.entities.size;
  }
}