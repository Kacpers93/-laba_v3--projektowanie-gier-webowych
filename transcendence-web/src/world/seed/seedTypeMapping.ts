import type { EntityCategory } from '@entities/base/EntityCategory';
import type { SeedObjectType } from './seedTypes';

export const SEED_TYPE_TO_CATEGORY: Record<SeedObjectType, EntityCategory> = {
  star: 'celestial',
  planet: 'celestial',
  moon: 'celestial',
  gate: 'gate',
  'station-wreck': 'wreck',
  station: 'station',
  container: 'environment',
  'ship-wreck': 'wreck',
  'npc-ship': 'ship',
  'player-ship': 'ship',
};

export const SEED_OBJECT_BASE_HEIGHT: Record<SeedObjectType, number> = {
  star: 1,
  planet: 2,
  moon: 3,
  gate: 4,
  'station-wreck': 5,
  station: 6,
  container: 8,
  'ship-wreck': 9,
  'npc-ship': 10,
  'player-ship': 11,
};

export const ASTEROID_BASE_HEIGHT = 7;
