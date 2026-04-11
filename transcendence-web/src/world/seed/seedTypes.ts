import type { Vector2 } from '@/types/common';

/** Pełny seed systemu startowego. */
export interface SystemSeed {
  /** Wersja schematu seeda. */
  schemaVersion: 1;

  /** Unikalny identyfikator systemu. */
  systemId: string;

  /** Nazwa systemu (do wyświetlania). */
  name: string;

  /** Punkt referencyjny systemu. Domyślnie { x: 0, y: 0 }. */
  center: Vector2;

  /** Promień granicy informacyjnej (px). UI może rysować tę granicę. */
  informationalBoundaryRadius: number;

  /** Maksymalna odległość od centrum, powyżej której obiekty są poza systemem (px). */
  maxBoundaryRadius: number;

  /** Lista obiektów systemu (bez asteroid — te są w asteroidGroups). */
  objects: SeedObject[];

  /** Definicje grup asteroid. Runtime rozwija je do encji. */
  asteroidGroups: AsteroidGroupDef[];
}

/** Pojedynczy obiekt w seedzie systemu. */
export interface SeedObject {
  /** Unikalny identyfikator obiektu w obrębie systemu. */
  id: string;

  /** Typ obiektu. */
  type: SeedObjectType;

  /** Identyfikator profilu wizualnego z VisualProfileRegistry. */
  profileId: string;

  /** Promień orbity w pikselach. 0 = w centrum systemu. */
  orbitRadius: number;

  /** Faza orbity w stopniach (0–360). Deterministyczna po generacji seeda. */
  orbitPhase: number;

  /** ID obiektu, wokół którego orbituje. null = centrum systemu. */
  orbitAround: string | null;

  /** Czy obiekt jest nieruchomy (nie ma update() runtime). */
  static: boolean;

  /** Wartość porządku rysowania. Większa = rysowane nad innymi. */
  height: number;
}

/** Dozwolone typy obiektów w seedzie. */
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

/** Runtime typ obiektu, uzupełniony o asteroidę generowaną z grup. */
export type RuntimeSeedObjectType = SeedObjectType | 'asteroid';

/** Definicja grupy asteroid w seedzie. */
export interface AsteroidGroupDef {
  /** Identyfikator grupy (np. 'belt-1'). */
  id: string;

  /** Promień orbity środka pasa od centrum systemu (px). */
  orbitRadius: number;

  /** Faza orbity środka pasa (stopnie, 0–360). */
  orbitPhase: number;

  /** ID obiektu, wokół którego orbituje pas. null = centrum systemu. */
  orbitAround?: string | null;

  /** Długość łuku/pasa w pikselach. */
  length: number;

  /** Grubość pasa w pikselach. */
  width: number;

  /** Średnia liczba asteroid na jednostkę długości. Ignorowane jeśli count jest podany. */
  density?: number;

  /** Opcjonalna dokładna liczba asteroid (nadpisuje density). */
  count?: number;

  /** Bazowe height dla pasa (domyślnie 7). */
  height: number;

  /** Indeks pasa do obliczania computedHeight. */
  beltIndex: number;

  /** Identyfikator profilu wizualnego dla asteroid w tym pasie. */
  profileId: string;

  /** Opcjonalny seed losowy dla deterministycznej generacji pozycji. */
  seed?: number;
}
