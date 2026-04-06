/**
 * Zarzadza budzetem pamieci cache bytow.
 * Nie zarzadza samym cache - tylko liczy bajty i sprawdza limit.
 */
export class EntityCacheBudget {
  private limit: number;
  private usedBytes = 0;

  public constructor(limitBytes: number = 64 * 1024 * 1024) {
    this.limit = Math.max(0, limitBytes);
  }

  /** Ustawia limit (bajty). */
  public setLimit(bytes: number): void {
    this.limit = Math.max(0, bytes);
  }

  /** Aktualny limit (bajty) - read-only. */
  public getLimit(): number {
    return this.limit;
  }

  /** Aktualnie zuzyte bajty - read-only. */
  public getUsedBytes(): number {
    return this.usedBytes;
  }

  /** Procent wykorzystania (0-100). */
  public getUsagePercent(): number {
    if (this.limit <= 0) {
      return this.usedBytes > 0 ? 100 : 0;
    }

    return (this.usedBytes / this.limit) * 100;
  }

  /** Czy przekroczony limit. */
  public isFull(): boolean {
    return this.usedBytes > this.limit;
  }

  /** Dodaj bajty (po dodaniu wpisu bytu). */
  public add(bytes: number): void {
    this.usedBytes += Math.max(0, bytes);
  }

  /** Odejmij bajty (po usunieciu wpisu bytu). */
  public subtract(bytes: number): void {
    this.usedBytes -= Math.max(0, bytes);
    if (this.usedBytes < 0) {
      this.usedBytes = 0;
    }
  }

  /** Resetuje licznik do 0. */
  public reset(): void {
    this.usedBytes = 0;
  }
}
