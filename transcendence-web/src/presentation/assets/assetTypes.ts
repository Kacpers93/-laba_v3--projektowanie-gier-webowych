/** Pojedynczy wpis assetu w manifeście. */
export interface AssetManifestEntry {
  /** Unikalny identyfikator assetu — staje się profileId w VisualProfileRegistry. */
  assetId: string;

  /** Kategoria bytu (musi odpowiadać EntityCategory). */
  category: 'ship' | 'station' | 'gate' | 'celestial';

  /** Ścieżka do pliku PNG względem roota serwera (np. '/art/ships/scout-mk1.png'). */
  url: string;

  /** Szerokość klatki sprite'a w pikselach. */
  frameWidth: number;

  /** Wysokość klatki sprite'a w pikselach. */
  frameHeight: number;

  /** Rozmiar wizualny obiektu w pikselach świata (do renderowania). */
  worldSize: {
    width: number;
    height: number;
  };

  /** Promień do frustum culling (px świata). */
  cullRadius: number;

  /** Wersja assetu — do inwalidacji cache. Format: integer >= 1. */
  version: number;

  /** Opcjonalne tagi do grupowania i filtrowania. */
  tags?: string[];
}

/** Pełny manifest assetów. */
export interface AssetManifest {
  /** Wersja schematu manifestu. */
  schemaVersion: 1;

  /** Timestamp ostatniej aktualizacji manifestu (ISO 8601). */
  updatedAt: string;

  /** Lista assetów. */
  assets: AssetManifestEntry[];
}