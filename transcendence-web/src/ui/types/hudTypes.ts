/**
 * Typy danych dla paneli HUD (etap 6).
 * Kontrakt danych dla 4 rogowych paneli ekranu lotu.
 */

// ---------------------------------------------------------------------------
// Radar
// ---------------------------------------------------------------------------

export type RadarContactType =
  | 'ship'
  | 'station'
  | 'planet'
  | 'star'
  | 'asteroid'
  | 'container'
  | 'wreck'
  | 'projectile'
  | 'other';

export type RelationStatus = 'friendly' | 'neutral' | 'hostile' | 'unknown';

export interface RadarContact {
  id: string;
  type: RadarContactType;
  relation: RelationStatus;
  worldX: number;
  worldY: number;
  active: boolean;
}

export interface RadarPayload {
  /** Biezacy zasieg efektywny radaru (px jednostki swiata). */
  rangeUnits: number;
  baseRangeUnits: number;
  rangeModifier: number;
  /** Pozycja gracza w przestrzeni swiata (centrum radaru). */
  centerWorld: { x: number; y: number };
  contacts: RadarContact[];
  /** Deterministyczny seed szumu low-res. */
  noiseSeed: number;
}

/** Konfiguracja startowa radaru (etap 6). */
export const RADAR_DEFAULT_CONFIG = {
  baseRangeUnits: 1200,
  rangeModifier: 1.0,
  minRangeUnits: 300,
} as const;

/** Stale mapowanie kolorow relacji na radarze. */
export const RADAR_RELATION_COLORS: Record<RelationStatus, string> = {
  friendly: '#4488ff',
  neutral: '#ffffff',
  hostile: '#ff4444',
  unknown: '#888888',
};

// ---------------------------------------------------------------------------
// Status statku
// ---------------------------------------------------------------------------

export interface ArmorSegment {
  slotId: string;
  currentHp: number;
  maxHp: number;
  /** Poczatkowy kat luku w stopniach (0 = gora). */
  mountArcStartDeg: number;
  /** Rozmiar luku w stopniach. */
  mountArcSizeDeg: number;
}

export interface ShipStatusPayload {
  shield: {
    currentHp: number;
    maxHp: number;
    /** Kat startowy pierscienia (stopnie). */
    ringStartDeg: number;
  };
  armor: {
    segments: ArmorSegment[];
  };
  velocity: {
    currentPxPerSec: number;
  };
}

/** Startowy profil testowy statusu statku (etap 6). */
export const SHIP_STATUS_TEST_PAYLOAD: ShipStatusPayload = {
  shield: { currentHp: 100, maxHp: 100, ringStartDeg: -90 },
  armor: {
    segments: [
      { slotId: 'armor-top', currentHp: 50, maxHp: 50, mountArcStartDeg: -45, mountArcSizeDeg: 90 },
      { slotId: 'armor-right', currentHp: 50, maxHp: 50, mountArcStartDeg: 45, mountArcSizeDeg: 90 },
      { slotId: 'armor-bottom', currentHp: 50, maxHp: 50, mountArcStartDeg: 135, mountArcSizeDeg: 90 },
      { slotId: 'armor-left', currentHp: 50, maxHp: 50, mountArcStartDeg: 225, mountArcSizeDeg: 90 },
    ],
  },
  velocity: { currentPxPerSec: 0 },
};

// ---------------------------------------------------------------------------
// Reaktor
// ---------------------------------------------------------------------------

export interface ReactorPayload {
  name: string;
  maxOutputMw: number;
  currentUsageMw: number;
  currentUsagePct: number;
  fuel: {
    currentUnits: number;
    maxUnits: number;
    pct: number;
  };
  iconKey: string;
}

/** Startowy profil testowy reaktora (etap 6). */
export const REACTOR_TEST_PAYLOAD: ReactorPayload = {
  name: 'Mk-I Fusion Core',
  maxOutputMw: 120,
  currentUsageMw: 42,
  currentUsagePct: 35,
  fuel: { currentUnits: 800, maxUnits: 1000, pct: 80 },
  iconKey: 'reactor-fusion',
};

// ---------------------------------------------------------------------------
// Cel
// ---------------------------------------------------------------------------

export type TargetObjectType = 'ship' | 'station' | 'wreck' | 'other';

export interface TargetPayload {
  selected: boolean;
  objectId: string | null;
  objectType: TargetObjectType | null;
  /** Kierunek celu w stopniach (tylko dla ship). */
  facingDeg: number | null;
  velocityPxPerSec: number | null;
  rangeUnits: number | null;
  shieldPct: number | null;
  armorPct: number | null;
  relation: RelationStatus | null;
}

/** Pusty target (brak zaznaczonego celu). */
export const TARGET_EMPTY_PAYLOAD: TargetPayload = {
  selected: false,
  objectId: null,
  objectType: null,
  facingDeg: null,
  velocityPxPerSec: null,
  rangeUnits: null,
  shieldPct: null,
  armorPct: null,
  relation: null,
};

// ---------------------------------------------------------------------------
// Wspolny kontekst HUD
// ---------------------------------------------------------------------------

export interface HudContext {
  timestampMs: number;
  playerShipId: string;
  hudLayoutId: string;
  radar: RadarPayload;
  shipStatus: ShipStatusPayload;
  reactor: ReactorPayload;
  target: TargetPayload;
}
