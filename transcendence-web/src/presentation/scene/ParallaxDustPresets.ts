import type { ParallaxSublayerConfig } from './ParallaxLayer';

export const PARALLAX_DUST_PRESET_SUBTLE: ParallaxSublayerConfig[] = [
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

export const PARALLAX_DUST_PRESET_COOL: ParallaxSublayerConfig[] = [
  {
    depthFactor: 0.05,
    tileX: true,
    tileY: true,
    opacity: 0.64,
    color: 'rgba(128, 168, 215, 1)',
    noiseIntensity: 0.6,
  },
  {
    depthFactor: 0.15,
    tileX: true,
    tileY: true,
    opacity: 0.62,
    color: 'rgba(100, 150, 205, 1)',
    noiseIntensity: 0.54,
  },
  {
    depthFactor: 0.3,
    tileX: true,
    tileY: true,
    opacity: 0.66,
    color: 'rgba(90, 130, 180, 1)',
    noiseIntensity: 0.48,
  },
];

export const PARALLAX_DUST_PRESET_WARM: ParallaxSublayerConfig[] = [
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

// Wybierz aktywny preset pyłu przez odkomentowanie jednej linii.
// export const ACTIVE_PARALLAX_DUST_PRESET = PARALLAX_DUST_PRESET_SUBTLE;
export const ACTIVE_PARALLAX_DUST_PRESET = PARALLAX_DUST_PRESET_COOL;
// export const ACTIVE_PARALLAX_DUST_PRESET = PARALLAX_DUST_PRESET_WARM;
