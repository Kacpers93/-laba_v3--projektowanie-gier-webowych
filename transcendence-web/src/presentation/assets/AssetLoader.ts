import type { AssetManifest } from './assetTypes';
import { validateManifest } from './validateManifest';

/**
 * Ładuje assety graficzne na podstawie manifestu.
 * Preloaduje obrazy przed startem gry. Obsługuje fallbacki.
 */
export class AssetLoader {
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly failedAssets = new Set<string>();
  private manifest: AssetManifest | null = null;

  /** Ładuje manifest z podanego URL. */
  public async loadManifest(url: string): Promise<AssetManifest | null> {
    this.images.clear();
    this.failedAssets.clear();
    this.manifest = null;

    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      console.error(`[AssetLoader] Failed to fetch manifest: ${url}.`, error);
      return null;
    }

    if (!response.ok) {
      console.error(`[AssetLoader] Failed to fetch manifest: ${url}. HTTP ${response.status}.`);
      return null;
    }

    let rawManifest: unknown;
    try {
      rawManifest = await response.json();
    } catch (error) {
      console.error(`[AssetLoader] Failed to parse manifest JSON: ${url}.`, error);
      return null;
    }

    const validatedManifest = validateManifest(rawManifest);
    if (!validatedManifest) {
      console.error(`[AssetLoader] Invalid manifest: ${url}.`);
      return null;
    }

    this.manifest = validatedManifest;
    return validatedManifest;
  }

  /** Preloaduje wszystkie obrazy z manifestu. Zwraca po zakończeniu ładowania. */
  public async preloadAll(): Promise<void> {
    if (!this.manifest) {
      return;
    }

    this.images.clear();
    this.failedAssets.clear();

    const loadingTasks = this.manifest.assets.map(async (entry) => {
      await new Promise<void>((resolve) => {
        const image = new Image();

        image.onload = () => {
          const widthDelta = Math.abs(image.width - entry.frameWidth);
          const heightDelta = Math.abs(image.height - entry.frameHeight);
          if (widthDelta > 2 || heightDelta > 2) {
            console.warn(
              `[AssetLoader] Sprite size mismatch for ${entry.assetId}. Expected ${entry.frameWidth}x${entry.frameHeight}, got ${image.width}x${image.height}.`,
            );
          }

          this.failedAssets.delete(entry.assetId);
          this.images.set(entry.assetId, image);
          resolve();
        };

        image.onerror = () => {
          console.warn(`[AssetLoader] Failed to load: ${entry.url}`);
          this.images.delete(entry.assetId);
          this.failedAssets.add(entry.assetId);
          resolve();
        };

        image.src = entry.url;
      });
    });

    await Promise.allSettled(loadingTasks);
  }

  /** Pobiera załadowany obraz po assetId. null jeśli nie załadowano. */
  public getImage(assetId: string): HTMLImageElement | null {
    return this.images.get(assetId) ?? null;
  }

  /** Czy asset się załadował poprawnie. */
  public isLoaded(assetId: string): boolean {
    return this.images.has(assetId);
  }

  /** Czy asset nie załadował się (błąd). */
  public isFailed(assetId: string): boolean {
    return this.failedAssets.has(assetId);
  }

  /** Załadowany manifest (null jeśli nie załadowano). */
  public getManifest(): AssetManifest | null {
    return this.manifest;
  }

  /** Statystyki ładowania. */
  public get stats(): { total: number; loaded: number; failed: number } {
    return {
      total: this.manifest?.assets.length ?? 0,
      loaded: this.images.size,
      failed: this.failedAssets.size,
    };
  }
}
