import type { ParallaxSublayerConfig } from './ParallaxLayer';

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

export const PARALLAX_SUBLAYERS_SUBTLE: ParallaxSublayerConfig[] = [
  {
    depthFactor: 0.05,
    tileX: true,
    tileY: true,
    opacity: 0.2,
    color: 'rgba(140, 165, 200, 1)',
    noiseIntensity: 0.5,
    densityMultiplier: 1,
  },
  {
    depthFactor: 0.15,
    tileX: true,
    tileY: true,
    opacity: 0.16,
    color: 'rgba(115, 150, 185, 1)',
    noiseIntensity: 0.45,
    densityMultiplier: 1,
  },
  {
    depthFactor: 0.3,
    tileX: true,
    tileY: true,
    opacity: 0.12,
    color: 'rgba(175, 150, 120, 1)',
    noiseIntensity: 0.4,
    densityMultiplier: 1,
  },
];

export const PARALLAX_SUBLAYERS_WARM: ParallaxSublayerConfig[] = [
  {
    depthFactor: 0.05,
    tileX: true,
    tileY: true,
    opacity: 0.82,
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
    opacity: 0.2,
    color: 'rgb(68, 157, 205)',
    noiseIntensity: 0.86,
    densityMultiplier: 0.2,
    particleMinSize: 0.9,
    particleMaxSize: 1.1,
  },
  {
    depthFactor: 0.3,
    tileX: true,
    tileY: true,
    opacity: 0.84,
    color: 'rgba(165, 142, 112, 1)',
    noiseIntensity: 0.78,
    densityMultiplier: 0.2,
    particleMinSize: 0.7,
    particleMaxSize: 1.4,
  },
];
