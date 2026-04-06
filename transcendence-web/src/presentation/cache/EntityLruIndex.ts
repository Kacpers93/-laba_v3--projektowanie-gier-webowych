/**
 * Indeks LRU dla kluczy cache bytow.
 * Sledzi kolejnosc dostepu i zwraca najstarszy klucz do eviction.
 */
export class EntityLruIndex {
  private counter = 0;
  private readonly accessMap = new Map<string, number>();

  /** Aktualizuje timestamp dostepu klucza. */
  public touch(key: string): void {
    this.counter += 1;
    this.accessMap.set(key, this.counter);
  }

  /** Usuwa klucz z indeksu. */
  public remove(key: string): void {
    this.accessMap.delete(key);
  }

  /** Zwraca klucz z najstarszym dostepem (LRU). undefined jesli pusty. */
  public getLruKey(): string | undefined {
    let lruKey: string | undefined;
    let oldestAccess = Number.POSITIVE_INFINITY;

    this.accessMap.forEach((access, key) => {
      if (access < oldestAccess) {
        oldestAccess = access;
        lruKey = key;
      }
    });

    return lruKey;
  }

  /** Czysci caly indeks. */
  public clear(): void {
    this.accessMap.clear();
  }

  /** Ile kluczy jest w indeksie. */
  public get size(): number {
    return this.accessMap.size;
  }
}
