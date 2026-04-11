import type { Vector2 } from '@/types/common';

/** Pelny seed systemu startowego. */
export interface SystemSeed {
  /** Wersja schematu seeda. */
  schemaVersion: 1;

  /** Unikalny identyfikator systemu. */
  systemId: string;

  /** Nazwa systemu (do wyswietlania). */
  name: string;

  /** Punkt referencyjny systemu. Domyslnie { x: 0, y: 0 }. */
  center: Vector2;

  /** Promien granicy informacyjnej (px). UI moze rysowac te granice. */
  informationalBoundaryRadius: number;

  /** Maksymalna odleglosc od centrum, powyzej ktorej obiekty sa poza systemem (px). */
  maxBoundaryRadius: number;

  /** Lista obiektow systemu (bez asteroid - te sa w asteroidGroups). */
  objects: SeedObject[];

  /** Definicje grup asteroid. Runtime rozwija je do encji. */
  asteroidGroups: AsteroidGroupDef[];
}

/** Pojedynczy obiekt w seedzie systemu. */
export interface SeedObject {
  /** Unikalny identyfikator obiektu w obrebie systemu. */
  id: string;

  /** Typ obiektu. */
  type: SeedObjectType;

  /** Identyfikator profilu wizualnego z VisualProfileRegistry. */
  profileId: string;

  /** Promien orbity w pikselach. 0 = w centrum systemu. */
  orbitRadius: number;

  /** Faza orbity w stopniach (0-360). Deterministyczna po generacji seeda. */
  orbitPhase: number;

  /** ID obiektu, wokol ktorego orbituje. null = centrum systemu. */
  orbitAround: string | null;

  /** Czy obiekt jest nieruchomy (nie ma update() runtime). */
  static: boolean;

  /** Wartosc porzadku rysowania. Wieksza = rysowane nad innymi. */
  height: number;
}

/** Dozwolone typy obiektow w seedzie. */
export type SeedObjectType =
  | 'star'
  | 'planet'
  | 'moon'
  | 'gate'
  | 'station-wreck'
  | 'station'
  | 'container'
  | 'ship-wreck'
  | 'npc-ship'
  | 'player-ship';

/** Runtime rozszerza typ obiektu o asteroidy wygenerowane z grup. */
export type RuntimeSeedObjectType = SeedObjectType | 'asteroid';

/** Definicja grupy asteroid w seedzie. */
export interface AsteroidGroupDef {
  /** Identyfikator grupy (np. 'belt-1'). */
  id: string;

  /** Promien orbity srodka pasa od centrum systemu (px). */
  orbitRadius: number;

  /** Faza orbity srodka pasa (stopnie, 0-360). */
  orbitPhase: number;

  /** ID obiektu, wokol ktorego orbituje pas. null = centrum systemu. */
  orbitAround?: string | null;

  /** Dlugosc luku/pasa w pikselach. */
  length: number;

  /** Grubosc pasa w pikselach. */
  width: number;

  /** Srednia liczba asteroid na jednostke dlugosci. Ignorowane jesli count jest podany. */
  density?: number;

  /** Opcjonalna dokladna liczba asteroid (nadpisuje density). */
  count?: number;

  /** Bazowe height dla pasa (domyslnie 7). */
  height: number;

  /** Indeks pasa do obliczania computedHeight. */
  beltIndex: number;

  /** Identyfikator profilu wizualnego dla asteroid w tym pasie. */
  profileId: string;

  /** Opcjonalny seed losowy dla deterministycznej generacji pozycji. */
  seed?: number;
}

/** Tabela bazowych wysokosci z dokumentacji etapu 5. */
export const BASE_HEIGHT_BY_SEED_TYPE: Record<RuntimeSeedObjectType, number> = {
  star: 1,
  planet: 2,
  moon: 3,
  gate: 4,
  'station-wreck': 5,
  station: 6,
  asteroid: 7,
  container: 8,
  'ship-wreck': 9,
  'npc-ship': 10,
  'player-ship': 11,
};

/** Lista do walidacji typow obiektow seedowych. */
export const SEED_OBJECT_TYPES: ReadonlyArray<SeedObjectType> = [
  'star',
  'planet',
  'moon',
  'gate',
  'station-wreck',
  'station',
  'container',
  'ship-wreck',
  'npc-ship',
  'player-ship',
];