import type { Vector2 } from '@/types/common';
import type { EntityCategory } from '@entities/base/EntityCategory';
import { computeFlightUpdate } from '@physics/movement/flightModel';
import type { FlightConfig } from '@systems/flight/flightConfig';
import type { RuntimeSeedObjectType } from '../seed/seedTypes';
import { WorldEntity } from './WorldEntity';

export class PlayerShipEntity extends WorldEntity {
  private currentAcceleration: Vector2 = { x: 0, y: 0 };
  private flightAssistEnabled = true;
  public readonly flightConfig: FlightConfig;

  public constructor(config: {
    id: string;
    category: EntityCategory;
    seedType: RuntimeSeedObjectType;
    position: Vector2;
    width: number;
    height: number;
    computedHeight: number;
    isStatic: boolean;
    profileId: string;
    flightConfig: FlightConfig;
  }) {
    super(config);
    this.flightConfig = {
      rearThrust: Math.abs(config.flightConfig.rearThrust),
      frontThrust: Math.abs(config.flightConfig.frontThrust),
      rotationSpeed: Math.abs(config.flightConfig.rotationSpeed),
      maxSpeed: Math.abs(config.flightConfig.maxSpeed),
      softDragCoefficient: config.flightConfig.softDragCoefficient,
      flightAssistDeadzone: config.flightConfig.flightAssistDeadzone,
    };
  }

  public get speed(): number {
    return Math.hypot(this.velocity.x, this.velocity.y);
  }

  public get currentVelocity(): Vector2 {
    return { x: this.velocity.x, y: this.velocity.y };
  }

  public get acceleration(): Vector2 {
    return { x: this.currentAcceleration.x, y: this.currentAcceleration.y };
  }

  public get heading(): number {
    return this.rotation;
  }

  public get isFlightAssistEnabled(): boolean {
    return this.flightAssistEnabled;
  }

  public toggleFlightAssist(): void {
    this.flightAssistEnabled = !this.flightAssistEnabled;
  }

  public updateFlight(dt: number, input: FlightInput): void {
    if (dt <= 0) {
      return;
    }

    const result = computeFlightUpdate(
      this.velocity,
      this.rotation,
      input,
      this.flightConfig,
      this.flightAssistEnabled,
      dt,
    );

    if (Number.isNaN(result.newVelocity.x) || Number.isNaN(result.newVelocity.y)) {
      this.velocity = { x: 0, y: 0 };
      this.currentAcceleration = { x: 0, y: 0 };
      console.error('[FlightModel] NaN detected, velocity reset.');
      return;
    }

    this.velocity = result.newVelocity;
    this.rotation = result.newRotation;
    this.currentAcceleration = result.acceleration;

    this.position = {
      x: this.position.x + this.velocity.x * dt,
      y: this.position.y + this.velocity.y * dt,
    };
  }
}

export interface FlightInput {
  rotateLeft: boolean;
  rotateRight: boolean;
  rearThruster: boolean;
  frontThruster: boolean;
}
