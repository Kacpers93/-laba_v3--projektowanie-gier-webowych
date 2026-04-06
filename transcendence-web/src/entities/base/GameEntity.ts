import type { EntityId, Vector2 } from '@/types/common';
import type { AABB } from '@physics/types';
import type { EntityCategory } from './EntityCategory';

/** Wspolny kontrakt kazdego bytu w swiecie gry. */
export interface GameEntity {
  /** Unikalny identyfikator w obrebie aktywnej sceny. */
  readonly id: EntityId;

  /** Kategoria bytu — statyczna, nie zmienia sie w runtime. */
  readonly category: EntityCategory;

  /** Pozycja w swiecie (jednostki: metry). */
  position: Vector2;

  /** Pozycja w poprzednim ticku — do interpolacji w renderze. */
  previousPosition: Vector2;

  /** Predkosc (jednostki: m/s). */
  velocity: Vector2;

  /** Kat obrotu w radianach. 0 = prawo, PI/2 = dol (uklad canvas). */
  rotation: number;

  /** Kat obrotu w poprzednim ticku — do interpolacji. */
  previousRotation: number;

  /** Bounding box do kolizji i culling. Wspolrzedne lokalne. */
  readonly boundingBox: AABB;

  /** Czy byt jest aktywny (zywy / istnieje w swiecie). */
  isAlive(): boolean;
}