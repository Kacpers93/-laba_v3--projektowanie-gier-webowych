import type { AssetManifest, AssetManifestEntry } from './assetTypes';

const VALID_CATEGORIES = new Set(['ship', 'station', 'gate', 'celestial']);
const ISO_8601_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

/**
 * Waliduje manifest i zwraca przefiltrowaną kopię z poprawnymi wpisami.
 * Loguje ostrzeżenia dla odrzuconych wpisów.
 */
export function validateManifest(raw: unknown): AssetManifest | null {
  if (!raw || typeof raw !== 'object') {
    console.error('[validateManifest] Invalid manifest: expected object.');
    return null;
  }

  const manifestCandidate = raw as Record<string, unknown>;

  if (manifestCandidate.schemaVersion !== 1) {
    console.error('[validateManifest] Unsupported schemaVersion. Expected 1.');
    return null;
  }

  if (!Array.isArray(manifestCandidate.assets)) {
    console.error('[validateManifest] Invalid manifest: "assets" must be an array.');
    return null;
  }

  if (typeof manifestCandidate.updatedAt !== 'string') {
    console.error('[validateManifest] Invalid manifest: "updatedAt" must be a string in ISO 8601 format.');
    return null;
  }

  const updatedAt = manifestCandidate.updatedAt.trim();
  if (!ISO_8601_TIMESTAMP_REGEX.test(updatedAt) || Number.isNaN(Date.parse(updatedAt))) {
    console.error('[validateManifest] Invalid manifest: "updatedAt" must be a valid ISO 8601 timestamp.');
    return null;
  }

  const validatedAssets: AssetManifestEntry[] = [];
  const seenAssetIds = new Set<string>();

  manifestCandidate.assets.forEach((asset, index) => {
    if (!asset || typeof asset !== 'object') {
      console.warn(`[validateManifest] Skipping entry at index ${index}: expected object.`);
      return;
    }

    const entry = asset as Record<string, unknown>;

    if (typeof entry.assetId !== 'string' || entry.assetId.trim().length === 0) {
      console.warn(`[validateManifest] Skipping entry at index ${index}: invalid assetId.`);
      return;
    }

    if (seenAssetIds.has(entry.assetId)) {
      console.warn(`[validateManifest] Duplicate assetId "${entry.assetId}" detected, skipping entry.`);
      return;
    }

    if (typeof entry.category !== 'string' || !VALID_CATEGORIES.has(entry.category)) {
      console.warn(`[validateManifest] Skipping asset "${entry.assetId}": invalid category.`);
      return;
    }

    if (typeof entry.url !== 'string' || !entry.url.startsWith('/art/') || !entry.url.endsWith('.png')) {
      console.warn(`[validateManifest] Skipping asset "${entry.assetId}": invalid url "${String(entry.url)}".`);
      return;
    }

    if (typeof entry.frameWidth !== 'number' || entry.frameWidth <= 0) {
      console.warn(`[validateManifest] Skipping asset "${entry.assetId}": frameWidth must be > 0.`);
      return;
    }

    if (typeof entry.frameHeight !== 'number' || entry.frameHeight <= 0) {
      console.warn(`[validateManifest] Skipping asset "${entry.assetId}": frameHeight must be > 0.`);
      return;
    }

    if (!entry.worldSize || typeof entry.worldSize !== 'object') {
      console.warn(`[validateManifest] Skipping asset "${entry.assetId}": worldSize is missing.`);
      return;
    }

    const worldSize = entry.worldSize as Record<string, unknown>;
    if (typeof worldSize.width !== 'number' || worldSize.width <= 0) {
      console.warn(`[validateManifest] Skipping asset "${entry.assetId}": worldSize.width must be > 0.`);
      return;
    }

    if (typeof worldSize.height !== 'number' || worldSize.height <= 0) {
      console.warn(`[validateManifest] Skipping asset "${entry.assetId}": worldSize.height must be > 0.`);
      return;
    }

    if (typeof entry.cullRadius !== 'number' || entry.cullRadius <= 0) {
      console.warn(`[validateManifest] Skipping asset "${entry.assetId}": cullRadius must be > 0.`);
      return;
    }

    if (typeof entry.version !== 'number' || !Number.isInteger(entry.version) || entry.version < 1) {
      console.warn(`[validateManifest] Skipping asset "${entry.assetId}": version must be an integer >= 1.`);
      return;
    }

    if (entry.tags !== undefined) {
      if (!Array.isArray(entry.tags) || entry.tags.some((tag) => typeof tag !== 'string')) {
        console.warn(`[validateManifest] Skipping asset "${entry.assetId}": tags must be an array of strings.`);
        return;
      }
    }

    const category = entry.category as AssetManifestEntry['category'];

    seenAssetIds.add(entry.assetId);

    validatedAssets.push({
      assetId: entry.assetId,
      category,
      url: entry.url,
      frameWidth: entry.frameWidth,
      frameHeight: entry.frameHeight,
      worldSize: {
        width: worldSize.width,
        height: worldSize.height,
      },
      cullRadius: entry.cullRadius,
      version: entry.version,
      tags: entry.tags,
    });
  });

  return {
    schemaVersion: 1,
    updatedAt,
    assets: validatedAssets,
  };
}
