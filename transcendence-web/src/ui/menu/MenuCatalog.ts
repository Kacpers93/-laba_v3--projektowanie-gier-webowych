/**
 * Katalog bazowy pozycji menu (etap 6).
 * Jedna definicja = wiele profili. Profil wskazuje id pozycji, nie kopiuje.
 */

import type { CatalogEntry } from '../types/menuTypes';

/**
 * Globalny katalog bazowy.
 * Klucz = CatalogEntry.id.
 */
export const MENU_CATALOG = new Map<string, CatalogEntry>([
  // --- Spoleczne / obiektowe ---
  [
    'ship-status',
    {
      id: 'ship-status',
      label: 'Ship Status',
      description: 'View current ship health, shields and modules.',
      children: ['inventory', 'modules'],
    },
  ],
  [
    'inventory',
    {
      id: 'inventory',
      label: 'Inventory',
      action: 'open-inventory',
      description: 'View cargo hold contents.',
    },
  ],
  [
    'modules',
    {
      id: 'modules',
      label: 'Modules',
      action: 'open-modules',
      description: 'Manage installed modules.',
    },
  ],
  [
    'weapons',
    {
      id: 'weapons',
      label: 'Weapons',
      action: 'open-weapons',
      description: 'Manage weapon loadout.',
    },
  ],
  [
    'commodities',
    {
      id: 'commodities',
      label: 'Commodities',
      action: 'open-commodities',
      description: 'Browse available goods for trade.',
    },
  ],
  [
    'dock',
    {
      id: 'dock',
      label: 'Dock',
      action: 'dock',
      description: 'Request docking clearance.',
    },
  ],
  [
    'missions',
    {
      id: 'missions',
      label: 'Missions',
      action: 'open-missions',
      description: 'View available missions and contracts.',
    },
  ],
  [
    'salvage',
    {
      id: 'salvage',
      label: 'Salvage',
      action: 'salvage',
      description: 'Begin salvage operation.',
    },
  ],
  [
    'services',
    {
      id: 'services',
      label: 'Services',
      action: 'open-services',
      description: 'Station services: repairs, refueling, upgrades.',
    },
  ],
  [
    'trade',
    {
      id: 'trade',
      label: 'Trade',
      action: 'open-trade',
      description: 'Open trading interface.',
    },
  ],
  [
    'loot',
    {
      id: 'loot',
      label: 'Loot',
      action: 'loot',
      description: 'Collect available items.',
    },
  ],
  [
    'transfer',
    {
      id: 'transfer',
      label: 'Transfer',
      action: 'transfer-cargo',
      description: 'Transfer cargo between ships.',
    },
  ],
  [
    'dump-cargo',
    {
      id: 'dump-cargo',
      label: 'Dump Cargo',
      action: 'dump-cargo',
      description: 'Jettison cargo into space.',
    },
  ],
  [
    'container-access',
    {
      id: 'container-access',
      label: 'Container Access',
      action: 'open-container',
      description: 'Open container contents.',
    },
  ],
  [
    'repair',
    {
      id: 'repair',
      label: 'Repair',
      action: 'repair',
      description: 'Initiate hull repair.',
    },
  ],
  [
    'help',
    {
      id: 'help',
      label: 'Help',
      action: 'open-help',
      description: 'View controls and game help.',
    },
  ],
  [
    'exit',
    {
      id: 'exit',
      label: 'Exit',
      action: 'close-menu',
      description: 'Close this menu and return to flight.',
    },
  ],

  // --- Menu gry (Esc poza menu obiektowym) ---
  [
    'resume',
    {
      id: 'resume',
      label: 'Resume',
      action: 'resume-game',
      description: 'Close menu and return to simulation.',
    },
  ],
  [
    'save-game',
    {
      id: 'save-game',
      label: 'Save Game',
      action: 'save-game',
      description: 'Save current game state.',
    },
  ],
  [
    'keybindings',
    {
      id: 'keybindings',
      label: 'Keybindings',
      action: 'open-keybindings',
      description: 'Configure key mappings.',
    },
  ],
  [
    'settings',
    {
      id: 'settings',
      label: 'Settings',
      action: 'open-settings',
      description: 'Audio, video and gameplay settings.',
    },
  ],
  [
    'exit-to-main-menu',
    {
      id: 'exit-to-main-menu',
      label: 'Exit to Main Menu',
      action: 'exit-to-main-menu',
      description: 'Return to the main menu.',
    },
  ],
]);
