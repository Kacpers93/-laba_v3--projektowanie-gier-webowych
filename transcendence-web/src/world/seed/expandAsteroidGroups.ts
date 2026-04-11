import type { Vector2 } from '@/types/common';
import { createDeterministicRng } from './deterministicRandom';
import { computeOrbitPosition } from './orbitUtils';
import type { AsteroidClusterAnchor, AsteroidGroupDef } from './seedTypes';

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
  clusterAnchors: AsteroidClusterAnchor[];
  warnings: string[];
}

/** Rozwija definicje asteroidGroups do listy pojedynczych asteroid. */
export function expandAsteroidGroups(input: ExpandAsteroidGroupsInput): ExpandAsteroidGroupsResult {
  const asteroids: ExpandedAsteroidObject[] = [];
  const clusterAnchors: AsteroidClusterAnchor[] = [];
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
    const radialDeltaX = beltCenter.x - parentPosition.x;
    const radialDeltaY = beltCenter.y - parentPosition.y;
    const radialLength = Math.hypot(radialDeltaX, radialDeltaY);

    const fallbackAngle = (group.orbitPhase * Math.PI) / 180;
    const radialAxisX = radialLength > 0 ? radialDeltaX / radialLength : Math.cos(fallbackAngle);
    const radialAxisY = radialLength > 0 ? radialDeltaY / radialLength : Math.sin(fallbackAngle);
    const centerAngle = Math.atan2(radialAxisY, radialAxisX);

    clusterAnchors.push({
      anchorId: `asteroid-cluster:${group.id}`,
      clusterId: group.id,
      position: { x: beltCenter.x, y: beltCenter.y },
    });

    const orbitCircumference = radialLength * 2 * Math.PI;
    const requestedArcLength = Math.max(0, group.length);
    const effectiveArcLength =
      orbitCircumference > 0 ? Math.min(requestedArcLength, orbitCircumference) : requestedArcLength;
    const arcSpan = radialLength > 0 ? effectiveArcLength / radialLength : 0;
    const halfArcSpan = arcSpan / 2;
    const fullOrbitCoverage = orbitCircumference > 0 && effectiveArcLength >= orbitCircumference;

    if (orbitCircumference > 0 && requestedArcLength > orbitCircumference) {
      warnings.push(
        `Asteroid group "${group.id}" length exceeded orbit circumference and was clamped to one full orbit.`,
      );
    }

    const halfWidth = group.width / 2;

    for (let i = 0; i < totalCount; i += 1) {
      const rng = groupRng ?? createDeterministicRng(group.beltIndex * 1000 + i);

      const longitudinalT = totalCount === 1 ? 0.5 : (i + rng()) / totalCount;
      const longitudinalNormalized = longitudinalT * 2 - 1;
      const longitudinalAbs = Math.abs(longitudinalNormalized);

      const diamondProfile = 1 - longitudinalAbs;
      const roundedEndsProfile = Math.sqrt(Math.max(0, 1 - longitudinalAbs * longitudinalAbs));
      const widthProfile = fullOrbitCoverage
        ? 1
        : Math.max(0, diamondProfile * 0.72 + roundedEndsProfile * 0.28);

      const localAngleOffset = longitudinalNormalized * halfArcSpan;
      const angle = centerAngle + localAngleOffset;

      const maxTransverseOffset = halfWidth * widthProfile;
      const transverseOffset = (rng() * 2 - 1) * maxTransverseOffset;

      const asteroidRadius = Math.max(0, radialLength + transverseOffset);

      asteroids.push({
        id: `${group.id}-ast-${i}`,
        type: 'asteroid',
        profileId: group.profileId,
        position: {
          x: parentPosition.x + asteroidRadius * Math.cos(angle),
          y: parentPosition.y + asteroidRadius * Math.sin(angle),
        },
        static: true,
        height: group.height,
        computedHeight: 7 + group.beltIndex / 100 + i / 1000,
      });
    }
  });

  return { asteroids, clusterAnchors, warnings };
}
