import type { Camera } from '@engine/renderer/Camera';
import type { SceneLayer } from '@presentation/scene/SceneLayer';

export class EffectsLayer implements SceneLayer {
  readonly order = 3;

  public update(_dt: number, _camera: Camera): void {
    // Stub — brak efektów cząsteczkowych w Etapie 2
  }

  public render(_ctx: CanvasRenderingContext2D, _camera: Camera, _alpha: number): void {
    // Stub — EffectsLayer będzie rysować cząstki i eksplozje w Etapie 9
  }
}
