import type { VisualProfile } from '@presentation/profiles/VisualProfile';
import type { VisualProfileRegistry } from '@presentation/profiles/VisualProfileRegistry';
import type { AssetManifest } from './assetTypes';

/**
 * Rejestruje profile wizualne w registry na podstawie manifestu assetów.
 * Zakłada unikalne `assetId` po `validateManifest`.
 * Jeśli `profileId` już istnieje w registry, wpis jest pomijany z ostrzeżeniem.
 */
export function registerManifestProfiles(manifest: AssetManifest, registry: VisualProfileRegistry): void {
  for (const entry of manifest.assets) {
    if (registry.has(entry.assetId)) {
      console.warn(`[registerManifestProfiles] Profile already registered: ${entry.assetId}, skipping.`);
      continue;
    }

    const profile: VisualProfile = {
      profileId: entry.assetId,
      category: entry.category,
      size: {
        width: entry.worldSize.width,
        height: entry.worldSize.height,
      },
      cullRadius: entry.cullRadius,
      source: {
        type: 'sprite',
        url: entry.url,
        frameWidth: entry.frameWidth,
        frameHeight: entry.frameHeight,
      },
    };

    registry.register(profile);
  }
}
