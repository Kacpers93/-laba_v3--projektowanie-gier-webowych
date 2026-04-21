/**
 * Typy danych dla systemu menu obiektowego (etap 6).
 * Model: registry + runtime payload.
 */

import type { RelationStatus } from './hudTypes';

// ---------------------------------------------------------------------------
// Typy obiektow i stany
// ---------------------------------------------------------------------------

export type MenuObjectType = 'playerShip' | 'station' | 'wreck' | 'container' | 'gameMenu';

export type ObjectState = 'active' | 'disabled' | 'destroyed' | 'docked' | 'looted';

/**
 * Par (objectType, objectState) identyfikuje profil menu.
 * Format: "objectType.state" np. "playerShip.default", "station.destroyed".
 */
export type MenuProfileId = string;

// ---------------------------------------------------------------------------
// Katalog bazowy
// ---------------------------------------------------------------------------

/** Definicja funkcjonalna jednej pozycji w katalogu bazowym. */
export interface CatalogEntry {
  /** Stabilny identyfikator pozycji. */
  id: string;
  /** Etykieta bazowa (moze byc nadpisana przez profil). */
  label: string;
  /** Bazowy hotkey (moze byc nadpisany przez resolver kolizji). */
  baseHotkey?: string;
  /** Dzieci (id innych pozycji katalogu). */
  children?: string[];
  /** Akcja liściowa (string opisujacy akcje). null = tylko podmenu. */
  action?: string;
  /** Opis pozycji (panel kontekstowy). */
  description?: string;
}

// ---------------------------------------------------------------------------
// Profile obiektow
// ---------------------------------------------------------------------------

/** Profil menu dla pary (objectType, objectState). */
export interface MenuProfile {
  id: MenuProfileId;
  objectType: MenuObjectType;
  /** Lista id pozycji z katalogu bazowego jako korzenie drzewa menu. */
  rootNodes: string[];
  /** Domyslna aktywna sciezka po wejsciu do menu. */
  defaultPath?: string[];
  /** Lokalne nadpisania etykiet: id pozycji -> nowa etykieta. */
  labelOverrides?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Runtime
// ---------------------------------------------------------------------------

/** Wezzel w runtime payload (gotowe do renderowania). */
export interface RuntimeMenuNode {
  id: string;
  label: string;
  /** Rozwiazany hotkey (po resolverze kolizji). */
  hotkey: string;
  children: RuntimeMenuNode[];
  action?: string;
  description?: string;
  /** Czy to liscie (brak dzieci). */
  isLeaf: boolean;
}

// ---------------------------------------------------------------------------
// Kontekst aktywnego obiektu
// ---------------------------------------------------------------------------

/** Parametry wejsciowe menu obiektowego. */
export interface MenuContext {
  objectType: MenuObjectType;
  objectState: ObjectState;
  /** Wyznaczony profil menu. */
  menuProfile: MenuProfileId;
  /** Lista id pozycji wystawianych przez runtime (podzbiór katalogu). */
  availableNodes: string[];
  /** Nazwa obiektu w naglowku menu. */
  sceneLabel: string;
  /** Opis obiektu. */
  sceneDescription?: string;
  /** Relacja gracza do obiektu (dla wyswietlania w naglowku). */
  relation?: RelationStatus;
}

// ---------------------------------------------------------------------------
// Reguly wyznaczania objectState i menuProfile
// ---------------------------------------------------------------------------

/** Priorytet stanow: destroyed > disabled > docked > looted > active. */
export const OBJECT_STATE_PRIORITY: ObjectState[] = [
  'destroyed',
  'disabled',
  'docked',
  'looted',
  'active',
];

/** Statyczne mapowanie (objectType, objectState) -> menuProfileId. */
export const OBJECT_STATE_PROFILE_MAP: Partial<Record<MenuObjectType, Partial<Record<ObjectState, MenuProfileId>>>> = {
  playerShip: {
    active: 'playerShip.default',
    docked: 'playerShip.docked',
  },
  station: {
    active: 'station.default',
    destroyed: 'station.destroyed',
  },
  wreck: {
    active: 'wreck.default',
    looted: 'wreck.looted',
  },
  container: {
    active: 'container.default',
    looted: 'container.looted',
  },
};

/**
 * Wyznacza menuProfileId na podstawie objectType i objectState.
 * Brak dopasowania = profileId domyslny: "objectType.default".
 */
export function resolveMenuProfile(objectType: MenuObjectType, objectState: ObjectState): MenuProfileId {
  const profileId = OBJECT_STATE_PROFILE_MAP[objectType]?.[objectState];
  return profileId ?? `${objectType}.default`;
}
