export class Vec2 {
  public static readonly ZERO = new Vec2(0, 0);

  constructor(public x: number = 0, public y: number = 0) {}

  public add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  public sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  public scale(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s);
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalize(): Vec2 {
    const len = this.length();
    return len > 0 ? this.scale(1 / len) : new Vec2();
  }

  public dot(v: Vec2): number {
    return this.x * v.x + this.y * v.y;
  }

  public distanceTo(v: Vec2): number {
    return this.sub(v).length();
  }
}
