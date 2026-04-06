import type { GameEntity } from './GameEntity';

/** Byt, ktory moze zostac zniszczony (HP, oslony). */
export interface DestroyableEntity extends GameEntity {
  /** Aktualne HP kadluba. */
  hullHp: number;

  /** Maksymalne HP kadluba. */
  readonly maxHullHp: number;

  /** Aktualne HP oslony (0 jesli brak oslony). */
  shieldHp: number;

  /** Maksymalne HP oslony. */
  readonly maxShieldHp: number;

  /** Zadaj obrazenia — oslona absorbuje pierwsza. */
  takeDamage(amount: number): void;
}