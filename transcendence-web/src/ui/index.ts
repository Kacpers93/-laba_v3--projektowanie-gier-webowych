/**
 * Publiczny interfejs modulu ui/.
 * Re-eksportuje kontrollery i typy publiczne.
 */

export { HudController } from './hud/HudController';
export { MenuController } from './menu/MenuController';
export { MenuRegistry } from './menu/MenuRegistry';
export { MenuRuntimeBuilder } from './menu/MenuRuntimeBuilder';
export { MenuView } from './menu/MenuView';

export type { HudContext, RadarContact, RadarPayload, ReactorPayload, ShipStatusPayload, TargetPayload } from './types/hudTypes';
export {
  RADAR_DEFAULT_CONFIG,
  RADAR_RELATION_COLORS,
  REACTOR_TEST_PAYLOAD,
  SHIP_STATUS_TEST_PAYLOAD,
  TARGET_EMPTY_PAYLOAD,
} from './types/hudTypes';

export type { CatalogEntry, MenuContext, MenuObjectType, MenuProfile, MenuProfileId, ObjectState, RuntimeMenuNode } from './types/menuTypes';
export { resolveMenuProfile } from './types/menuTypes';
