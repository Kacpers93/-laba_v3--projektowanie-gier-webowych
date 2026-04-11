import type { EntityManager } from '@entities/base/EntityManager';
import type { Renderable } from '@/types/engine';
import type { RenderableFactory } from '@presentation/renderables/RenderableFactory';
import type { VisualProfile, VisualProfileRegistry } from '@presentation/profiles';
import type { WorldLayer } from '@presentation/scene/WorldLayer';
import type { Vector2 } from '@/types/common';
import { ASTEROID_BASE_HEIGHT } from './seedTypeMapping';
import { computeOrbitPosition } from './orbitUtils';
import { createDeterministicRng } from './deterministicRandom';
import type { AsteroidGroupDef } from './seedTypes';
import { WorldEntity } from '../entities/WorldEntity';

export interface ExpandAsteroidGroupsParams {
  groups: AsteroidGroupDef[];
  centerPosition: Vector2;
  boundaryRadius: number;
  entityManager: EntityManager;
  profileRegistry: VisualProfileRegistry;
  renderableFactory: RenderableFactory;
  worldLayer: WorldLayer;
  renderablesByEntityId: Map<string, Renderable>;
  parentPositions: Map<string, Vector2>;
  logWarning: (message: string) => void;
  logError: (message: string) => void;
}

export interface ExpandAsteroidGroupsResult {
  asteroidCount: number;
}

const FALLBACK_ASTEROID_COLOR = '#9ab3c9';

function isInsideBoundary(position: Vector2, centerPosition: Vector2, boundaryRadius: number): boolean {
  const dx = position.x - centerPosition.x;
  const dy = position.y - centerPosition.y;
  return dx * dx + dy * dy <= boundaryRadius * boundaryRadius;
}

function buildFallbackProfile(profileId: string): VisualProfile {
  return {
    profileId,
    category: 'celestial',
    size: { width: 36, height: 36 },
    cullRadius: 26,
    source: {
      type: 'procedural',
      drawFn: (ctx, width, height) => {
        ctx.fillStyle = FALLBACK_ASTEROID_COLOR;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.fillStyle = '#0f172a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('asteroid', 0, 0);
      },
    },
  };
}

function resolveAsteroidProfile(
  group: AsteroidGroupDef,
  profileRegistry: VisualProfileRegistry,
  logWarning: (message: string) => void,
): VisualProfile {
  const profile = profileRegistry.get(group.profileId);
  if (profile) {
    return profile;
  }

  logWarning(`Missing asteroid profile "${group.profileId}" for group "${group.id}", using fallback.`);
  return buildFallbackProfile(`fallback-${group.profileId}-asteroid`);
}

export function expandAsteroidGroups(params: ExpandAsteroidGroupsParams): ExpandAsteroidGroupsResult {
  let asteroidCount = 0;

  params.groups.forEach((group) => {
    const parentPosition =
      (group.orbitAround ? params.parentPositions.get(group.orbitAround) : undefined) ?? params.centerPosition;

    if (group.orbitAround && !params.parentPositions.has(group.orbitAround)) {
      params.logError(`Missing orbitAround parent "${group.orbitAround}" for asteroid group "${group.id}".`);
      return;
    }

    const profile = resolveAsteroidProfile(group, params.profileRegistry, params.logWarning);
    const asteroidTotal =
      typeof group.count === 'number' && Number.isFinite(group.count) && group.count > 0
        ? Math.floor(group.count)
        : Math.max(0, Math.round(group.length * (group.density ?? 0)));

    if (asteroidTotal <= 0) {
      params.logWarning(`Skipping asteroid group "${group.id}": no asteroids to spawn.`);
      return;
    }

    const groupCenter = computeOrbitPosition(parentPosition, group.orbitRadius, group.orbitPhase);
    const baseSeed = typeof group.seed === 'number' ? group.seed : group.beltIndex * 1000;
    const rng = createDeterministicRng(baseSeed);

    for (let index = 0; index < asteroidTotal; index += 1) {
      const offsetX = (rng() - 0.5) * group.length;
      const offsetY = (rng() - 0.5) * group.width;
      const position = {
        x: groupCenter.x + offsetX,
        y: groupCenter.y + offsetY,
      };

      if (!isInsideBoundary(position, params.centerPosition, params.boundaryRadius)) {
        params.logWarning(`Skipping asteroid "${group.id}-ast-${index}": outside maxBoundaryRadius.`);
        continue;
      }

      const entityId = `${group.id}-ast-${index}`;
      if (params.entityManager.has(entityId)) {
        params.logError(`Duplicate asteroid entity id "${entityId}" detected, skipping.`);
        continue;
      }

      const computedHeight = ASTEROID_BASE_HEIGHT + group.beltIndex / 100 + index / 1000;
      const entity = new WorldEntity({
        id: entityId,
        category: 'celestial',
        seedType: 'asteroid',
        position,
        width: profile.size.width,
        height: profile.size.height,
        computedHeight,
        isStatic: true,
        profileId: profile.profileId,
      });

      params.entityManager.add(entity);
      const renderable = params.renderableFactory.create(entity, profile);
      params.renderablesByEntityId.set(entity.id, renderable);
      params.worldLayer.addRenderable(renderable);
      asteroidCount += 1;
    }
  });

  return { asteroidCount };
}
