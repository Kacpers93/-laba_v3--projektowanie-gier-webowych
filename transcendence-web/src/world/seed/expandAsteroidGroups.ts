import type { Vector2 } from '@/types/common';
import { createDeterministicRng } from './deterministicRandom';
import { computeOrbitPosition } from './orbitUtils';
import type { AsteroidGroupDef } from './seedTypes';

export interface ExpandedAsteroidObject {
  id: string;
  type: 'asteroid';
  profileId: string;
  position: Vector2;
  static: true;
  height: number;
  computedHeight: number;
}

export interface ExpandAsteroidGroupsInput {
  groups: AsteroidGroupDef[];
  systemCenter: Vector2;
  parentPositions: ReadonlyMap<string, Vector2>;
}

export interface ExpandAsteroidGroupsResult {
  asteroids: ExpandedAsteroidObject[];
  warnings: string[];
}

/** Rozwija definicje asteroidGroups do listy pojedynczych asteroid. */
export function expandAsteroidGroups(input: ExpandAsteroidGroupsInput): ExpandAsteroidGroupsResult {
  const asteroids: ExpandedAsteroidObject[] = [];
  const warnings: string[] = [];

  input.groups.forEach((group) => {
    const totalCount =
      typeof group.count === 'number'
        ? Math.max(0, Math.round(group.count))
        : Math.max(0, Math.round(group.length * (group.density ?? 0)));

    if (totalCount <= 0) {
      warnings.push(`Asteroid group "${group.id}" resolved to 0 asteroids and was skipped.`);
      return;
    }

    let parentPosition = input.systemCenter;
    if (group.orbitAround) {
      const resolvedParent = input.parentPositions.get(group.orbitAround);
      if (!resolvedParent) {
        warnings.push(
          `Asteroid group "${group.id}" references missing parent "${group.orbitAround}" and was skipped.`,
        );
        return;
      }

      parentPosition = resolvedParent;
    }

    const beltCenter = computeOrbitPosition(parentPosition, group.orbitRadius, group.orbitPhase);
    const groupRng = group.seed !== undefined ? createDeterministicRng(group.seed) : null;

    for (let i = 0; i < totalCount; i += 1) {
      const rng = groupRng ?? createDeterministicRng(group.beltIndex * 1000 + i);

      const offsetX = (rng() - 0.5) * group.length;
      const offsetY = (rng() - 0.5) * group.width;

      asteroids.push({
        id: `${group.id}-ast-${i}`,
        type: 'asteroid',
        profileId: group.profileId,
        position: {
          x: beltCenter.x + offsetX,
          y: beltCenter.y + offsetY,
        },
        static: true,
        height: group.height,
        computedHeight: 7 + group.beltIndex / 100 + i / 1000,
      });
    }
  });

  return { asteroids, warnings };
}
