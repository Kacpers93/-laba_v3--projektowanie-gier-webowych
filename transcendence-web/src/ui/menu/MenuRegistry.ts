/**
 * Registry profili menu obiektowych (etap 6).
 * Kazdy profil wskazuje zbior pozycji z katalogu bazowego.
 */

import type { MenuProfile, MenuProfileId } from '../types/menuTypes';

const PROFILES: MenuProfile[] = [
  // --- Statek gracza ---
  {
    id: 'playerShip.default',
    objectType: 'playerShip',
    rootNodes: ['ship-status', 'modules', 'help', 'exit'],
    defaultPath: [],
  },
  {
    id: 'playerShip.docked',
    objectType: 'playerShip',
    rootNodes: ['ship-status', 'modules', 'inventory', 'help', 'exit'],
    defaultPath: [],
  },

  // --- Stacja ---
  {
    id: 'station.default',
    objectType: 'station',
    rootNodes: ['commodities', 'dock', 'missions', 'services', 'trade', 'help', 'exit'],
    defaultPath: [],
  },
  {
    id: 'station.destroyed',
    objectType: 'station',
    rootNodes: ['salvage', 'container-access', 'transfer', 'help', 'exit'],
    defaultPath: [],
    labelOverrides: { exit: 'Leave' },
  },

  // --- Wrak statku ---
  {
    id: 'wreck.default',
    objectType: 'wreck',
    rootNodes: ['salvage', 'inventory', 'dump-cargo', 'help', 'exit'],
    defaultPath: [],
  },
  {
    id: 'wreck.looted',
    objectType: 'wreck',
    rootNodes: ['inventory', 'transfer', 'dump-cargo', 'help', 'exit'],
    defaultPath: [],
    labelOverrides: { inventory: 'Empty Hold' },
  },

  // --- Kontener ---
  {
    id: 'container.default',
    objectType: 'container',
    rootNodes: ['container-access', 'loot', 'transfer', 'exit'],
    defaultPath: [],
  },
  {
    id: 'container.looted',
    objectType: 'container',
    rootNodes: ['container-access', 'exit'],
    defaultPath: [],
    labelOverrides: { 'container-access': 'Empty Container' },
  },

  // --- Menu gry (Esc poza menu obiektowym) ---
  {
    id: 'game-menu',
    objectType: 'gameMenu',
    rootNodes: ['resume', 'save-game', 'keybindings', 'settings', 'exit-to-main-menu'],
    defaultPath: [],
  },
];

export class MenuRegistry {
  private readonly profiles = new Map<MenuProfileId, MenuProfile>();

  public constructor() {
    for (const profile of PROFILES) {
      this.profiles.set(profile.id, profile);
    }
  }

  public get(id: MenuProfileId): MenuProfile | undefined {
    return this.profiles.get(id);
  }

  public has(id: MenuProfileId): boolean {
    return this.profiles.has(id);
  }

  /** Zwraca profil lub profil domyslny dla objectType. */
  public getOrDefault(id: MenuProfileId, objectType: string): MenuProfile | undefined {
    return this.profiles.get(id) ?? this.profiles.get(`${objectType}.default`);
  }
}
