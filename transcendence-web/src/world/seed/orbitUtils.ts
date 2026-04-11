import type { Vector2 } from '@/types/common';

/** Oblicza pozycję na orbicie. */
export function computeOrbitPosition(
  parentPosition: Vector2,
  orbitRadius: number,
  orbitPhaseDeg: number,
): Vector2 {
  const rad = (orbitPhaseDeg * Math.PI) / 180;
  return {
    x: parentPosition.x + orbitRadius * Math.cos(rad),
    y: parentPosition.y + orbitRadius * Math.sin(rad),
  };
}
