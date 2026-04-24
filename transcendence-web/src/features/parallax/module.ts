import type { FeatureModule } from '@/app/composition/FeatureModule';
import type { RuntimeContext } from '@/app/composition/RuntimeContext';
import { ACTIVE_PARALLAX_SUBLAYERS } from './config';
import type { ParallaxFeatureConfig } from './contracts';
import { ParallaxLayer } from './scene/ParallaxLayer';

class ParallaxFeatureModule implements FeatureModule {
  public readonly id = 'parallax';

  private context: RuntimeContext | null = null;
  private parallaxLayer: ParallaxLayer | null = null;
  private readonly config: ParallaxFeatureConfig;

  public constructor(config: ParallaxFeatureConfig) {
    this.config = config;
  }

  public setup(context: RuntimeContext): void {
    this.context = context;
  }

  public start(): void {
    if (!this.context || this.parallaxLayer) {
      return;
    }

    const { pixelWidth, pixelHeight } = this.context.getViewport();
    this.parallaxLayer = new ParallaxLayer(
      this.context.cache,
      pixelWidth,
      pixelHeight,
      this.config.sublayers,
    );
    this.context.sceneRenderer.addLayer(this.parallaxLayer);
  }

  public onResize(width: number, height: number): void {
    this.parallaxLayer?.regenerate(width, height);
  }

  public dispose(): void {
    if (!this.context || !this.parallaxLayer) {
      return;
    }

    this.context.sceneRenderer.removeLayer(this.parallaxLayer);
    this.parallaxLayer = null;
  }
}

export function createParallaxFeatureModule(): FeatureModule {
  return new ParallaxFeatureModule({
    sublayers: ACTIVE_PARALLAX_SUBLAYERS,
  });
}
