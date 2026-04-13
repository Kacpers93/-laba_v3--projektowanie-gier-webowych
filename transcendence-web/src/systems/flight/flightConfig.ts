/** Hardkodowane parametry lotu dla Etapu 5.5. */
export interface FlightConfig {
  /** Sila rear thrustera [px/s^2]. */
  readonly rearThrust: number;

  /** Sila front thrustera (hamowanie) [px/s^2]. Wzgledna do rear: 0.3. */
  readonly frontThrust: number;

  /** Predkosc obrotu [rad/s]. */
  readonly rotationSpeed: number;

  /** Maksymalna predkosc przed soft drag [px/s]. */
  readonly maxSpeed: number;

  /** Wspolczynnik soft drag powyzej maxSpeed x 1.1. */
  readonly softDragCoefficient: number;

  /** Prog deadzone dla Flight Assist [px/s]. */
  readonly flightAssistDeadzone: number;
}

/** Domyslna konfiguracja v0. */
export const DEFAULT_FLIGHT_CONFIG: FlightConfig = {
  rearThrust: 120,
  frontThrust: 36,
  rotationSpeed: 3.0,
  maxSpeed: 300,
  softDragCoefficient: 0.15,
  flightAssistDeadzone: 0.5,
};
