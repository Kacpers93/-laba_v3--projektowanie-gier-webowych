type CacheEntry = {
  canvas: OffscreenCanvas;
  width: number;
  height: number;
};

export class OffscreenCache {
  private readonly entries = new Map<string, CacheEntry>();

  public get size(): number {
    return this.entries.size;
  }

  public get estimatedBytes(): number {
    let total = 0;
    for (const entry of this.entries.values()) {
      total += entry.width * entry.height * 4;
    }
    return total;
  }

  public getOrCreate(
    key: string,
    width: number,
    height: number,
    renderFn: (ctx: OffscreenCanvasRenderingContext2D) => void,
  ): OffscreenCanvas {
    const existing = this.entries.get(key);
    if (existing && existing.width === width && existing.height === height) {
      return existing.canvas;
    }

    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error(`Unable to create offscreen canvas context for ${key}`);
    }

    renderFn(context);
    this.entries.set(key, { canvas, width, height });
    return canvas;
  }

  public invalidate(key: string): void {
    this.entries.delete(key);
  }

  public clear(): void {
    this.entries.clear();
  }
}
