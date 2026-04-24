import type { OffscreenCache } from '@presentation/cache/OffscreenCache';
import type { SceneRenderer } from '@presentation/scene/SceneRenderer';

export type RuntimeViewport = {
  pixelWidth: number;
  pixelHeight: number;
};

export interface RuntimeContext {
  cache: OffscreenCache;
  sceneRenderer: SceneRenderer;
  getViewport(): RuntimeViewport;
}
