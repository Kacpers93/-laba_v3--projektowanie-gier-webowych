import type { Camera } from '@engine/renderer/Camera';
import type { SceneLayer } from './SceneLayer';

export class WorldLayer implements SceneLayer {
  readonly order = 2;

  public update(_dt: number, _camera: Camera): void {
    // Stub — brak obiektów świata w Etapie 2
  }

  public render(_ctx: CanvasRenderingContext2D, _camera: Camera, _alpha: number): void {
    // Stub — WorldLayer będzie rysować obiekty świata w Etapie 3
  }
}
