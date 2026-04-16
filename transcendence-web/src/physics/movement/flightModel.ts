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
  dt: number,
): FlightUpdateResult {
  const autoStopFineSpeed = 24;
  const autoStopAlignmentToBrake = 0.9;
  const autoStopRotationEpsilon = 0.03;
  const currentSpeed = Math.hypot(currentVelocity.x, currentVelocity.y);
  let newRotation = currentRotation;

  if (input.autoStop && currentSpeed >= config.flightAssistDeadzone) {
    const targetHeading = Math.atan2(-currentVelocity.y, -currentVelocity.x);
    const rotationFactor = currentSpeed > autoStopFineSpeed ? 1 : 0.35;
    newRotation = rotateTowards(
      currentRotation,
      targetHeading,
      config.rotationSpeed * rotationFactor * dt,
    );

    if (Math.abs(shortestAngleDelta(newRotation, targetHeading)) <= autoStopRotationEpsilon) {
      newRotation = targetHeading;
    }
  } else {
    if (input.rotateLeft) {
      newRotation -= config.rotationSpeed * dt;
    }
    if (input.rotateRight) {
      newRotation += config.rotationSpeed * dt;
    }
  }

  const headingX = Math.cos(newRotation);
  const headingY = Math.sin(newRotation);

  let ax = 0;
  let ay = 0;

  if (input.autoStop && currentSpeed >= config.flightAssistDeadzone) {
    const stopDirectionX = -currentVelocity.x / currentSpeed;
    const stopDirectionY = -currentVelocity.y / currentSpeed;
    const alignment = headingX * stopDirectionX + headingY * stopDirectionY;

    if (currentSpeed > autoStopFineSpeed && alignment >= autoStopAlignmentToBrake) {
      ax += headingX * config.rearThrust;
      ay += headingY * config.rearThrust;
    } else if (currentSpeed <= autoStopFineSpeed) {
      // W koncowej fazie hamowania stosujemy lagodne, osiowe domykanie predkosci.
      const fineBrakeAccel = Math.min(config.frontThrust, currentSpeed / Math.max(dt, 1e-6));
      ax += stopDirectionX * fineBrakeAccel;
      ay += stopDirectionY * fineBrakeAccel;
    }
  }

  if (input.rearThruster && !input.autoStop) {
    ax += headingX * config.rearThrust;
    ay += headingY * config.rearThrust;
  }

  if (input.frontThruster && !input.autoStop) {
    ax -= headingX * config.frontThrust;
    ay -= headingY * config.frontThrust;
  }

  let newVx = currentVelocity.x + ax * dt;
  let newVy = currentVelocity.y + ay * dt;

  if (input.autoStop && Math.hypot(newVx, newVy) < config.flightAssistDeadzone) {
    newVx = 0;
    newVy = 0;
  }

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

function rotateTowards(from: number, to: number, maxStep: number): number {
  const delta = shortestAngleDelta(from, to);
  const clampedDelta = Math.max(-maxStep, Math.min(maxStep, delta));
  return from + clampedDelta;
}

function shortestAngleDelta(from: number, to: number): number {
  const twoPi = Math.PI * 2;
  return ((to - from + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
}
