import type { MenuProfile } from './types';

export const DEFAULT_MENU_PROFILE_ID = 'default-minimal';

export const MENU_PROFILES: Readonly<Record<string, MenuProfile>> = {
  [DEFAULT_MENU_PROFILE_ID]: {
    id: DEFAULT_MENU_PROFILE_ID,
    rootNodeIds: ['help', 'exit'],
    enabledNodeIds: ['help', 'exit'],
  },
  'player-ship': {
    id: 'player-ship',
    rootNodeIds: ['ship-status', 'modules', 'weapons', 'help', 'exit'],
    enabledNodeIds: ['ship-status', 'inventory', 'reactor', 'modules', 'weapons', 'help', 'exit'],
    defaultExpandedPath: ['ship-status'],
  },
  station: {
    id: 'station',
    rootNodeIds: ['commodities', 'trade', 'dock', 'missions', 'services', 'help', 'exit'],
    enabledNodeIds: ['commodities', 'trade', 'dock', 'missions', 'services', 'help', 'exit'],
    labelOverrides: {
      dock: 'Dock Control',
    },
  },
  wreck: {
    id: 'wreck',
    rootNodeIds: ['ship-status', 'salvage', 'help', 'exit'],
    enabledNodeIds: ['ship-status', 'inventory', 'reactor', 'modules', 'salvage', 'repair', 'help', 'exit'],
    labelOverrides: {
      'ship-status': 'Wreck Status',
    },
    nodeExtensions: {
      salvage: ['repair'],
    },
  },
  'salvage-ship': {
    id: 'salvage-ship',
    rootNodeIds: ['ship-status', 'modules', 'salvage', 'repair', 'help', 'exit'],
    enabledNodeIds: ['ship-status', 'inventory', 'reactor', 'modules', 'salvage', 'repair', 'help', 'exit'],
    defaultExpandedPath: ['ship-status'],
  },
};
