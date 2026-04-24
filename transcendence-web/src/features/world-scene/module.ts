import type { FeatureModule } from '@/app/composition/FeatureModule';
import type { RuntimeContext } from '@/app/composition/RuntimeContext';
import type { WorldSceneModuleHooks } from './contracts';
import { DebugLayer } from './scene/DebugLayer';
import { EffectsLayer } from './scene/EffectsLayer';
import { WorldLayer } from './scene/WorldLayer';

class WorldSceneFeatureModule implements FeatureModule {
  public readonly id = 'world-scene';

  private context: RuntimeContext | null = null;
  private readonly worldLayer = new WorldLayer();
  private readonly effectsLayer = new EffectsLayer();
  private readonly debugLayer = new DebugLayer();
  private started = false;

  public constructor(private readonly hooks: WorldSceneModuleHooks) {
  }

  public setup(context: RuntimeContext): void {
    this.context = context;
    this.hooks.onWorldLayerReady?.(this.worldLayer);
  }

  public start(): void {
    if (!this.context || this.started) {
      return;
    }

    this.context.sceneRenderer.addLayer(this.worldLayer);
    this.context.sceneRenderer.addLayer(this.effectsLayer);
    this.context.sceneRenderer.addLayer(this.debugLayer);
    this.started = true;
  }

  public onResize(_width: number, _height: number): void {
    // no-op for now
  }

  public dispose(): void {
    if (!this.context || !this.started) {
      return;
    }

    this.context.sceneRenderer.removeLayer(this.debugLayer);
    this.context.sceneRenderer.removeLayer(this.effectsLayer);
    this.context.sceneRenderer.removeLayer(this.worldLayer);
    this.started = false;
  }
}

export function createWorldSceneFeatureModule(hooks: WorldSceneModuleHooks = {}): FeatureModule {
  return new WorldSceneFeatureModule(hooks);
}
