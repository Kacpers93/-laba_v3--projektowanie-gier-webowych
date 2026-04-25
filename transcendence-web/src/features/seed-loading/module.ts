import { AssetLoader } from '@assets/AssetLoader';
import { registerManifestProfiles } from '@assets/registerManifestProfiles';
import { VisualProfileRegistry } from '@presentation/profiles';
import { SystemSeedLoader } from '@world/seed';
import type { SystemLoadResult } from '@world/seed';

export interface SeedLoadingResult {
  loadResult: SystemLoadResult;
}

export class SeedLoadingFeatureModule {
  public constructor(
    private readonly assetLoader: AssetLoader,
    private readonly visualProfileRegistry: VisualProfileRegistry,
    private readonly systemSeedLoader: SystemSeedLoader,
  ) {
  }

  public async load(systemSeedUrl: string): Promise<SeedLoadingResult> {
    const manifest = await this.assetLoader.loadManifest('/art/asset-manifest.json');
    if (manifest) {
      await this.assetLoader.preloadAll();
      registerManifestProfiles(manifest, this.visualProfileRegistry);
    }

    const loadResult = await this.systemSeedLoader.loadSystem(systemSeedUrl);
    return { loadResult };
  }
}

export function createSeedLoadingFeatureModule(
  assetLoader: AssetLoader,
  visualProfileRegistry: VisualProfileRegistry,
  systemSeedLoader: SystemSeedLoader,
): SeedLoadingFeatureModule {
  return new SeedLoadingFeatureModule(assetLoader, visualProfileRegistry, systemSeedLoader);
}
