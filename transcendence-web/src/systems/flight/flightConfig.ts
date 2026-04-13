/** Hardcoded flight parameters for stage 5.5. */
export interface FlightConfig {
  /** Rear thruster force [px/s^2]. */
  readonly rearThrust: number;

  /** Front thruster force (braking) [px/s^2]. */
  readonly frontThrust: number;

  /** Rotation speed [rad/s]. */
  readonly rotationSpeed: number;

  /** Max speed before soft drag [px/s]. */
  readonly maxSpeed: number;

  /** Soft drag coefficient above maxSpeed * 1.1. */
  readonly softDragCoefficient: number;

  /** Deadzone threshold for Flight Assist [px/s]. */
  readonly flightAssistDeadzone: number;
}

/** Default v0 flight configuration. */
export const DEFAULT_FLIGHT_CONFIG: FlightConfig = {
  rearThrust: 120,
  frontThrust: 36,
  rotationSpeed: 3,
  maxSpeed: 300,
  softDragCoefficient: 0.15,
  flightAssistDeadzone: 0.5,
};
