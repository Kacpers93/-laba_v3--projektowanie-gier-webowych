import type { EntityCategory } from '@entities/base/EntityCategory';

/**
 * Profil wizualny opisuje jak rysowac byt danego typu.
 * To dane, nie logika — profil nie rysuje sam, ale dostarcza informacje
 * potrzebne EntityRenderable do renderowania.
 */
export interface VisualProfile {
  /** Unikalna nazwa profilu (np. 'scout-mark-i', 'trading-station-alpha'). */
  readonly profileId: string;

  /** Kategoria bytu, dla ktorego profil jest przeznaczony. */
  readonly category: EntityCategory;

  /** Rozmiar wizualny obiektu w pikselach swiata (szerokosc x wysokosc). */
  readonly size: { width: number; height: number };

  /** Promien do frustum culling (px swiata). */
  readonly cullRadius: number;

  /** Zrodlo grafiki profilu. */
  readonly source: VisualSource;
}

/** Zrodlo grafiki profilu. */
export type VisualSource =
  | { type: 'procedural'; drawFn: ProceduralDrawFn }
  | { type: 'sprite'; url: string; frameWidth: number; frameHeight: number };

/**
 * Funkcja rysujaca byt proceduralnie.
 * Rysuje w ukladzie lokalnym — (0,0) = centrum obiektu, ctx jest juz przetransformowany.
 */
export type ProceduralDrawFn = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
) => void;