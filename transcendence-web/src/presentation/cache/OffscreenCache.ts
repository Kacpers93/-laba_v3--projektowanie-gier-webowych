export class OffscreenCache {
  private readonly cache = new Map<
    string,
    { canvas: OffscreenCanvas; width: number; height: number }
  >();

  public getOrCreate(
    key: string,
    width: number,
    height: number,
    renderFn: (ctx: OffscreenCanvasRenderingContext2D) => void,
  ): OffscreenCanvas {
    const entry = this.cache.get(key);

    if (entry && entry.width === width && entry.height === height) {
      return entry.canvas;
    }

    const offscreenCanvas = new OffscreenCanvas(width, height);
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from OffscreenCanvas');
    }

    renderFn(ctx);
    this.cache.set(key, { canvas: offscreenCanvas, width, height });
    return offscreenCanvas;
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
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
}
