import type { FeatureModule } from '@/app/composition/FeatureModule';
import type { RuntimeContext } from '@/app/composition/RuntimeContext';
import { DEFAULT_BACKGROUND_CONFIG } from './config';
import type { BackgroundFeatureConfig } from './contracts';
import { BackgroundLayer } from './scene/BackgroundLayer';

class BackgroundFeatureModule implements FeatureModule {
  public readonly id = 'background';

  private context: RuntimeContext | null = null;
  private backgroundLayer: BackgroundLayer | null = null;
  private readonly config: BackgroundFeatureConfig;

  public constructor(config: BackgroundFeatureConfig) {
    this.config = config;
  }

  public setup(context: RuntimeContext): void {
    this.context = context;
  }

  public start(): void {
    if (!this.context || this.backgroundLayer) {
      return;
    }

    const { pixelWidth, pixelHeight } = this.context.getViewport();
    this.backgroundLayer = new BackgroundLayer(
      this.context.cache,
      pixelWidth,
      pixelHeight,
      this.config.layerConfig,
    );
    this.context.sceneRenderer.addLayer(this.backgroundLayer);
  }

  public onResize(width: number, height: number): void {
    this.backgroundLayer?.regenerate(width, height);
  }

  public dispose(): void {
    if (!this.context || !this.backgroundLayer) {
      return;
    }

    this.context.sceneRenderer.removeLayer(this.backgroundLayer);
    this.backgroundLayer = null;
  }
}

export function createBackgroundFeatureModule(): FeatureModule {
  return new BackgroundFeatureModule({
    layerConfig: DEFAULT_BACKGROUND_CONFIG,
  });
}
