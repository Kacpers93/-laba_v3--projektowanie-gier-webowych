import type { BackgroundConfig } from './scene/BackgroundLayer';

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  starCount: 400,
  minBrightness: 0.3,
  maxBrightness: 1.0,
  minSize: 0.3,
  maxSize: 0.8,
  depthFactor: 0.015,
};
