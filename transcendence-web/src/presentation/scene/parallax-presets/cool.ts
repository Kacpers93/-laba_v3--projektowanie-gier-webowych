import type { ParallaxSublayerConfig } from '../ParallaxLayer';

export const PARALLAX_SUBLAYERS_COOL: ParallaxSublayerConfig[] = [
  {
    depthFactor: 0.05,
    tileX: true,
    tileY: true,
    opacity: 0.64,
    color: 'rgba(128, 168, 215, 1)',
    noiseIntensity: 0.6,
    densityMultiplier: 1,
  },
  {
    depthFactor: 0.15,
    tileX: true,
    tileY: true,
    opacity: 0.62,
    color: 'rgba(100, 150, 205, 1)',
    noiseIntensity: 0.54,
    densityMultiplier: 1,
  },
  {
    depthFactor: 0.3,
    tileX: true,
    tileY: true,
    opacity: 0.66,
    color: 'rgba(90, 130, 180, 1)',
    noiseIntensity: 0.48,
    densityMultiplier: 1,
  },
];
