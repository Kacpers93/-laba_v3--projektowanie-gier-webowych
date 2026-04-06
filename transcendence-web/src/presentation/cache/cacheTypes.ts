/** Wpis w cache - offscreen canvas z metadanymi rozmiaru. */
export interface CacheEntry {
  canvas: OffscreenCanvas;
  width: number;
  height: number;
}

/** Prefiks klucza bytow - cache bytow podlega limitowi i LRU. */
export const ENTITY_KEY_PREFIX = 'entity-';

/** Sprawdza, czy klucz to klucz bytu. */
export function isEntityKey(key: string): boolean {
  return key.startsWith(ENTITY_KEY_PREFIX);
}

/** Szacuje rozmiar wpisu w bajtach (RGBA, 4 bajty na piksel). */
export function estimateEntryBytes(width: number, height: number): number {
  return width * height * 4;
}
