import type { ParallaxSublayerConfig } from '../ParallaxLayer';

export const PARALLAX_SUBLAYERS_WARM: ParallaxSublayerConfig[] = [
  {
    depthFactor: 0.05,
    tileX: true,
    tileY: true,
    opacity: 0.62,
    color: 'rgba(178, 162, 135, 1)',
    noiseIntensity: 0.92,
  },
  {
    depthFactor: 0.15,
    tileX: true,
    tileY: true,
    opacity: 0.52,
    color: 'rgba(165, 142, 112, 1)',
    noiseIntensity: 0.86,
  },
  {
    depthFactor: 0.3,
    tileX: true,
    tileY: true,
    opacity: 0.4,
    color: 'rgba(154, 122, 95, 1)',
    noiseIntensity: 0.78,
  },
];
