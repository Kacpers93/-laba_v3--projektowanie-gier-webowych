import type { ParallaxSublayerConfig } from '../ParallaxLayer';

export const PARALLAX_SUBLAYERS_WARM: ParallaxSublayerConfig[] = [
  {
    depthFactor: 0.05,
    tileX: true,
    tileY: true,
    opacity: 1.62,
    color: 'rgba(178, 162, 135, 1)',
    noiseIntensity: 0.92,
    densityMultiplier: 0.2,
    particleMinSize: 0.2,
    particleMaxSize: 1.8,
  },
  {
    depthFactor: 0.15,
    tileX: true,
    tileY: true,
    opacity: 0.52,
    color: 'rgba(165, 142, 112, 1)',
    noiseIntensity: 0.86,
    densityMultiplier: 0.2,
    particleMinSize: 0.9,
    particleMaxSize: 1.1,
  },
  {
    depthFactor: 0.3,
    tileX: true,
    tileY: true,
    opacity: 0.4,
    color: 'rgba(154, 122, 95, 1)',
    noiseIntensity: 0.78,
    densityMultiplier: 0.2,
    particleMinSize: 0.7,
    particleMaxSize: 1.4,
  },
];
