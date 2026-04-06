import { EntityCacheBudget } from './EntityCacheBudget';
import { EntityLruIndex } from './EntityLruIndex';
import type { CacheEntry } from './cacheTypes';
import { estimateEntryBytes, isEntityKey } from './cacheTypes';

export class OffscreenCache {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly entityBudget = new EntityCacheBudget();
  private readonly lruIndex = new EntityLruIndex();

  public getOrCreate(
    key: string,
    width: number,
    height: number,
    renderFn: (ctx: OffscreenCanvasRenderingContext2D) => void,
  ): OffscreenCanvas {
    const entry = this.cache.get(key);

    if (entry && entry.width === width && entry.height === height) {
      this.touchEntityKeyIfNeeded(key);
      return entry.canvas;
    }

    if (entry) {
      this.removeKeyAccounting(key, entry.width, entry.height);
    }

    const offscreenCanvas = new OffscreenCanvas(width, height);
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from OffscreenCanvas');
    }

    renderFn(ctx);
    this.cache.set(key, { canvas: offscreenCanvas, width, height });
    this.addKeyAccounting(key, width, height);
    this.evictEntityCacheIfNeeded();
    return offscreenCanvas;
  }

  public invalidate(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.removeKeyAccounting(key, entry.width, entry.height);
    }
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
    this.entityBudget.reset();
    this.lruIndex.clear();
  }

  /** Ustawia limit pamieci dla cache bytow (bajty). Domyslnie: 64 MB. */
  public setEntityCacheLimit(bytes: number): void {
    this.entityBudget.setLimit(bytes);
    this.evictEntityCacheIfNeeded();
  }

  /** Czy cache bytow przekracza limit. */
  public isEntityCacheFull(): boolean {
    return this.entityBudget.isFull();
  }

  /** Ile bajtow cache bytow jest wykorzystane. */
  public get entityCacheBytes(): number {
    return this.entityBudget.getUsedBytes();
  }

  /** Aktualny limit cache bytow (bajty). */
  public get entityCacheLimit(): number {
    return this.entityBudget.getLimit();
  }

  /** Procent wykorzystania limitu cache bytow (0-100). */
  public get entityCachePercent(): number {
    return this.entityBudget.getUsagePercent();
  }

  public get size(): number {
    return this.cache.size;
  }

  public get estimatedBytes(): number {
    let total = 0;
    this.cache.forEach((entry) => {
      total += entry.width * entry.height * 4;
    });
    return total;
  }

  private touchEntityKeyIfNeeded(key: string): void {
    if (!isEntityKey(key) || !this.cache.has(key)) {
      return;
    }

    this.lruIndex.touch(key);
  }

  private addKeyAccounting(key: string, width: number, height: number): void {
    if (!isEntityKey(key)) {
      return;
    }

    this.entityBudget.add(estimateEntryBytes(width, height));
    this.lruIndex.touch(key);
  }

  private removeKeyAccounting(key: string, width: number, height: number): void {
    if (!isEntityKey(key)) {
      return;
    }

    this.entityBudget.subtract(estimateEntryBytes(width, height));
    this.lruIndex.remove(key);
  }

  private evictEntityCacheIfNeeded(): void {
    while (this.isEntityCacheFull()) {
      const lruKey = this.lruIndex.getLruKey();

      if (!lruKey) {
        break;
      }

      const entry = this.cache.get(lruKey);
      if (!entry) {
        this.lruIndex.remove(lruKey);
        continue;
      }

      this.removeKeyAccounting(lruKey, entry.width, entry.height);
      this.cache.delete(lruKey);
    }
  }
}
