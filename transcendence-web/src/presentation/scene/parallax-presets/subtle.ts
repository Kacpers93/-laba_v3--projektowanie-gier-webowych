import type { ParallaxSublayerConfig } from '../ParallaxLayer';

export const PARALLAX_SUBLAYERS_SUBTLE: ParallaxSublayerConfig[] = [
  {
    depthFactor: 0.05,
    tileX: true,
    tileY: true,
    opacity: 0.2,
    color: 'rgba(140, 165, 200, 1)',
    noiseIntensity: 0.5,
  },
  {
    depthFactor: 0.15,
    tileX: true,
    tileY: true,
    opacity: 0.16,
    color: 'rgba(115, 150, 185, 1)',
    noiseIntensity: 0.45,
  },
  {
    depthFactor: 0.3,
    tileX: true,
    tileY: true,
    opacity: 0.12,
    color: 'rgba(175, 150, 120, 1)',
    noiseIntensity: 0.4,
  },
];
