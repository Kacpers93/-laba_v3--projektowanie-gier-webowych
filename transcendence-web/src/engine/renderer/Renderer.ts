export class Renderer {
  private readonly context: CanvasRenderingContext2D;
  private canvasWidth = 0;
  private canvasHeight = 0;

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
    return this.canvasWidth;
  }

  public get height(): number {
    return this.canvasHeight;
  }

  public clear(): void {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context.fillStyle = '#000000';
    this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  public resize(width: number, height: number): void {
    this.canvasWidth = Math.max(1, Math.floor(width));
    this.canvasHeight = Math.max(1, Math.floor(height));

    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    this.canvas.style.width = `${this.canvasWidth}px`;
    this.canvas.style.height = `${this.canvasHeight}px`;
  }
}
