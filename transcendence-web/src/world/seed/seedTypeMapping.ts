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
