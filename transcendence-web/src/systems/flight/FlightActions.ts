/**
 * Minimal flight actions for stage 5.5.
 * v0 without key rebinding.
 */
export const FLIGHT_KEY_MAP = {
  'rotate-left': 'a',
  'rotate-right': 'd',
  'rear-thruster': 'w',
  'front-thruster': 's',
  'toggle-flight-assist': 'control',
} as const;

export type FlightActionId = keyof typeof FLIGHT_KEY_MAP;
