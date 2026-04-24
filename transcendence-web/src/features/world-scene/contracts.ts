import type { WorldLayer } from './scene/WorldLayer';

export interface WorldSceneModuleHooks {
  onWorldLayerReady?: (worldLayer: WorldLayer) => void;
}
