import type { Vector2 } from '@/types/common';
import type { FlightConfig } from '@systems/flight/flightConfig';
import type { FlightInput } from '@world/entities/PlayerShipEntity';

export interface FlightUpdateResult {
  newVelocity: Vector2;
  newRotation: number;
  acceleration: Vector2;
}

/**
 * Czysta funkcja update fizyki lotu.
 * Nie mutuje zadnych obiektow - zwraca nowy stan.
 */
export function computeFlightUpdate(
  currentVelocity: Vector2,
  currentRotation: number,
  input: FlightInput,
  config: FlightConfig,
  flightAssistEnabled: boolean,
  dt: number,
): FlightUpdateResult {
  let newRotation = currentRotation;
  if (input.rotateLeft) {
    newRotation -= config.rotationSpeed * dt;
  }
  if (input.rotateRight) {
    newRotation += config.rotationSpeed * dt;
  }

  const headingX = Math.cos(newRotation);
  const headingY = Math.sin(newRotation);

  let ax = 0;
  let ay = 0;

  if (input.rearThruster) {
    ax += headingX * config.rearThrust;
    ay += headingY * config.rearThrust;
  }

  if (input.frontThruster) {
    ax -= headingX * config.frontThrust;
    ay -= headingY * config.frontThrust;
  }

  if (flightAssistEnabled) {
    const faAccel = computeFlightAssist(currentVelocity, newRotation, config, dt);
    ax += faAccel.x;
    ay += faAccel.y;
  }

  let newVx = currentVelocity.x + ax * dt;
  let newVy = currentVelocity.y + ay * dt;

  const speed = Math.hypot(newVx, newVy);
  const softLimit = config.maxSpeed * 1.1;
  if (speed > softLimit) {
    const drag = config.softDragCoefficient * (speed - softLimit);
    newVx -= (newVx / speed) * drag * dt;
    newVy -= (newVy / speed) * drag * dt;
  }

  return {
    newVelocity: { x: newVx, y: newVy },
    newRotation,
    acceleration: { x: ax, y: ay },
  };
}

/**
 * Oblicza przyspieszenie Flight Assist.
 * FA hamuje predkosc boczna i wsteczna, nie hamuje ruchu do przodu.
 */
function computeFlightAssist(
  velocity: Vector2,
  rotation: number,
  config: FlightConfig,
  _dt: number,
): Vector2 {
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed < config.flightAssistDeadzone) {
    return { x: 0, y: 0 };
  }

  const headingX = Math.cos(rotation);
  const headingY = Math.sin(rotation);

  const forwardComponent = velocity.x * headingX + velocity.y * headingY;

  const lateralX = -headingY;
  const lateralY = headingX;
  const lateralComponent = velocity.x * lateralX + velocity.y * lateralY;

  let ax = 0;
  let ay = 0;

  if (forwardComponent < -1) {
    ax += headingX * config.frontThrust;
    ay += headingY * config.frontThrust;
  }

  if (lateralComponent > 1) {
    ax -= lateralX * config.frontThrust;
    ay -= lateralY * config.frontThrust;
  }
  if (lateralComponent < -1) {
    ax += lateralX * config.frontThrust;
    ay += lateralY * config.frontThrust;
  }

  return { x: ax, y: ay };
}
