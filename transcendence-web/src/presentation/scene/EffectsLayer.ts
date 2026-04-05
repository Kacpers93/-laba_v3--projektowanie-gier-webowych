import type { Camera } from '@engine/renderer/Camera';
import type { SceneLayer } from './SceneLayer';

export class EffectsLayer implements SceneLayer {
  public readonly order = 3;

  public update(_dt: number, _camera: Camera): void {
    // Etap 2: stub.
  }

  public render(_ctx: CanvasRenderingContext2D, _camera: Camera, _alpha: number): void {
    // Etap 2: stub.
  }
}
