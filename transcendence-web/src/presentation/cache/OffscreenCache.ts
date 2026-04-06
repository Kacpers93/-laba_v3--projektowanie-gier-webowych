export class OffscreenCache {
  private readonly cache = new Map<
    string,
    { canvas: OffscreenCanvas; width: number; height: number }
  >();
  private entityCacheLimit = 64 * 1024 * 1024;
  private entityCacheBytes = 0;
  private entityAccessCounter = 0;
  private readonly entityAccess = new Map<string, number>();

  public getOrCreate(
    key: string,
    width: number,
    height: number,
    renderFn: (ctx: OffscreenCanvasRenderingContext2D) => void,
  ): OffscreenCanvas {
    const entry = this.cache.get(key);

    if (entry && entry.width === width && entry.height === height) {
      this.touchEntityKey(key);
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
    this.entityCacheBytes = 0;
    this.entityAccess.clear();
    this.entityAccessCounter = 0;
  }

  /** Ustawia limit pamieci dla cache bytow (bajty). Domyslnie: 64 MB. */
  public setEntityCacheLimit(bytes: number): void {
    this.entityCacheLimit = Math.max(0, bytes);
    this.evictEntityCacheIfNeeded();
  }

  /** Czy cache bytow przekracza limit. */
  public isEntityCacheFull(): boolean {
    return this.entityCacheBytes > this.entityCacheLimit;
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

  private isEntityKey(key: string): boolean {
    return key.startsWith('entity-');
  }

  private estimateEntryBytes(width: number, height: number): number {
    return width * height * 4;
  }

  private touchEntityKey(key: string): void {
    if (!this.isEntityKey(key) || !this.cache.has(key)) {
      return;
    }
    this.entityAccessCounter += 1;
    this.entityAccess.set(key, this.entityAccessCounter);
  }

  private addKeyAccounting(key: string, width: number, height: number): void {
    if (!this.isEntityKey(key)) {
      return;
    }

    this.entityCacheBytes += this.estimateEntryBytes(width, height);
    this.entityAccessCounter += 1;
    this.entityAccess.set(key, this.entityAccessCounter);
  }

  private removeKeyAccounting(key: string, width: number, height: number): void {
    if (!this.isEntityKey(key)) {
      return;
    }

    this.entityCacheBytes -= this.estimateEntryBytes(width, height);
    if (this.entityCacheBytes < 0) {
      this.entityCacheBytes = 0;
    }
    this.entityAccess.delete(key);
  }

  private evictEntityCacheIfNeeded(): void {
    while (this.isEntityCacheFull()) {
      let lruKey: string | undefined;
      let oldestAccess = Number.POSITIVE_INFINITY;

      this.entityAccess.forEach((access, key) => {
        if (access < oldestAccess) {
          oldestAccess = access;
          lruKey = key;
        }
      });

      if (!lruKey) {
        break;
      }

      const entry = this.cache.get(lruKey);
      if (!entry) {
        this.entityAccess.delete(lruKey);
        continue;
      }

      this.removeKeyAccounting(lruKey, entry.width, entry.height);
      this.cache.delete(lruKey);
    }
  }
}
