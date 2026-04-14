const LARGE_VIEWPORT_ENTER_AREA_THRESHOLD = 1_600_000;
const LARGE_VIEWPORT_EXIT_AREA_THRESHOLD = 1_350_000;
const LARGE_VIEWPORT_RENDER_SCALE = 0.65;

export class Renderer {
  private readonly context: CanvasRenderingContext2D;
  private displayWidth = 0;
  private displayHeight = 0;
  private canvasWidth = 0;
  private canvasHeight = 0;
  private renderScale = 1;

  public constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is not available.');
    }

    this.context = ctx;
    this.resize(window.innerWidth, window.innerHeight);
  }

  public get ctx(): CanvasRenderingContext2D {
    return this.context;
  }

  public get width(): number {
    return this.displayWidth;
  }

  public get height(): number {
    return this.displayHeight;
  }

  public get pixelWidth(): number {
    return this.canvasWidth;
  }

  public get pixelHeight(): number {
    return this.canvasHeight;
  }

  public get scale(): number {
    return this.renderScale;
  }

  public clear(): void {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context.fillStyle = '#000000';
    this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  public resize(width: number, height: number): void {
    this.displayWidth = Math.max(1, Math.floor(width));
    this.displayHeight = Math.max(1, Math.floor(height));
    this.renderScale = this.resolveRenderScale(this.displayWidth, this.displayHeight);

    this.canvasWidth = Math.max(1, Math.floor(this.displayWidth * this.renderScale));
    this.canvasHeight = Math.max(1, Math.floor(this.displayHeight * this.renderScale));

    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    this.canvas.style.width = `${this.displayWidth}px`;
    this.canvas.style.height = `${this.displayHeight}px`;
  }

  private resolveRenderScale(width: number, height: number): number {
    const viewportArea = width * height;

    if (this.renderScale < 1) {
      if (viewportArea <= LARGE_VIEWPORT_EXIT_AREA_THRESHOLD) {
        return 1;
      }

      return LARGE_VIEWPORT_RENDER_SCALE;
    }

    if (viewportArea >= LARGE_VIEWPORT_ENTER_AREA_THRESHOLD) {
      return LARGE_VIEWPORT_RENDER_SCALE;
    }

    return 1;
  }
}
