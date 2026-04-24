import type { RuntimeContext } from './RuntimeContext';

export interface FeatureModule {
  readonly id: string;

  setup(context: RuntimeContext): void;

  start(): void;

  onResize(width: number, height: number): void;

  dispose(): void;
}
