import type { EntityManager } from '@entities/base/EntityManager';
import type { Renderable } from '@/types/engine';
import type { RenderableFactory } from '@presentation/renderables/RenderableFactory';
import type { VisualProfile, VisualProfileRegistry } from '@presentation/profiles';
import type { WorldLayer } from '@presentation/scene/WorldLayer';
import type { Vector2 } from '@/types/common';
import { SEED_TYPE_TO_CATEGORY, SEED_OBJECT_BASE_HEIGHT } from './seedTypeMapping';
import { computeOrbitPosition } from './orbitUtils';
import { expandAsteroidGroups } from './expandAsteroidGroups';
import { validateSystemSeed } from './validateSystemSeed';
import type { SeedObject, SeedObjectType, SystemSeed } from './seedTypes';
import { WorldEntity } from '../entities/WorldEntity';

export interface SystemLoadResult {
  systemId: string;
  entityCount: number;
  renderableCount: number;
  asteroidCount: number;
  warnings: string[];
  errors: string[];
  loadTimeMs: number;
}

type SeedObjectState = SeedObject & {
  position: Vector2;
  computedHeight: number;
  visible: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isInsideBoundary(position: Vector2, center: Vector2, radius: number): boolean {
  const dx = position.x - center.x;
  const dy = position.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
}

function createFallbackProfile(seedType: SeedObjectType, profileId: string): VisualProfile {
  const colors: Record<SeedObjectType, string> = {
    star: '#ffd166',
    planet: '#6ec6ff',
    moon: '#c5d1de',
    gate: '#f8b195',
    'station-wreck': '#ff8a65',
    station: '#8ed081',
    container: '#f4a261',
    'ship-wreck': '#d0a2f7',
    'npc-ship': '#4cc9f0',
    'player-ship': '#2ec4b6',
  };

  const sizes: Record<SeedObjectType, { width: number; height: number }> = {
    star: { width: 220, height: 220 },
    planet: { width: 140, height: 140 },
    moon: { width: 72, height: 72 },
    gate: { width: 100, height: 100 },
    'station-wreck': { width: 110, height: 80 },
    station: { width: 110, height: 90 },
    container: { width: 52, height: 36 },
    'ship-wreck': { width: 90, height: 56 },
    'npc-ship': { width: 48, height: 30 },
    'player-ship': { width: 48, height: 30 },
  };

  const size = sizes[seedType];
  return {
    profileId,
    category: SEED_TYPE_TO_CATEGORY[seedType],
    size,
    cullRadius: Math.max(size.width, size.height) / 2,
    source: {
      type: 'procedural',
      drawFn: (ctx, width, height) => {
        ctx.fillStyle = colors[seedType];
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.fillStyle = '#0f172a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(seedType, 0, 0);
      },
    },
  };
}

export class SystemSeedLoader {
  private readonly fallbackProfiles = new Map<string, VisualProfile>();
  private readonly loadedEntityIds = new Set<string>();

  public constructor(
    private readonly entityManager: EntityManager,
    private readonly profileRegistry: VisualProfileRegistry,
    private readonly renderableFactory: RenderableFactory,
    private readonly worldLayer: WorldLayer,
    private readonly renderablesByEntityId: Map<string, Renderable>,
  ) {}

  /** Ładuje seed z URL, waliduje, instancjonuje, rejestruje. */
  public async loadSystem(url: string): Promise<SystemLoadResult> {
    const startedAt = performance.now();
    this.unloadCurrentSystem();

    const warnings: string[] = [];
    const errors: string[] = [];
    const logWarning = (message: string): void => {
      const formatted = `[SystemSeedLoader] ${message}`;
      warnings.push(formatted);
      console.warn(formatted);
    };
    const logError = (message: string): void => {
      const formatted = `[SystemSeedLoader] ${message}`;
      errors.push(formatted);
      console.error(formatted);
    };

    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      logError(`Failed to fetch seed: ${url}.`);
      console.error(error);
      return this.finishLoad(url, startedAt, warnings, errors, 0, 0);
    }

    if (!response.ok) {
      logError(`Failed to fetch seed: ${url}. HTTP ${response.status}.`);
      return this.finishLoad(url, startedAt, warnings, errors, 0, 0);
    }

    let rawSeed: unknown;
    try {
      rawSeed = await response.json();
    } catch (error) {
      logError(`Failed to parse seed JSON: ${url}.`);
      console.error(error);
      return this.finishLoad(url, startedAt, warnings, errors, 0, 0);
    }

    const validation = validateSystemSeed(rawSeed);
    validation.warnings.forEach((warning) => logWarning(warning.replace(/^\[SystemSeedLoader\] /, '')));
    validation.errors.forEach((error) => logError(error.replace(/^\[SystemSeedLoader\] /, '')));

    if (!validation.seed) {
      return this.finishLoad(url, startedAt, warnings, errors, 0, 0);
    }

    const seed = validation.seed;
    const resolvedPositions = this.computeResolvedPositions(seed, logError);
    let entityCount = 0;
    let renderableCount = 0;

    seed.objects.forEach((object, index) => {
      const position = resolvedPositions.get(object.id);
      if (!position) {
        logError(`Missing computed position for object "${object.id}".`);
        return;
      }

      if (object.static && !isInsideBoundary(position, seed.center, seed.maxBoundaryRadius)) {
        logWarning(`Skipping object "${object.id}": outside maxBoundaryRadius.`);
        return;
      }

      const profile = this.resolveProfile(object, logWarning);
      const computedHeight = object.height + index / 10000;
      const entity = new WorldEntity({
        id: object.id,
        category: SEED_TYPE_TO_CATEGORY[object.type],
        seedType: object.type,
        position,
        width: profile.size.width,
        height: profile.size.height,
        computedHeight,
        isStatic: object.static,
        profileId: profile.profileId,
      });

      if (this.entityManager.has(entity.id)) {
        logError(`Duplicate entity id "${entity.id}" detected at instantiation time.`);
        return;
      }

      this.entityManager.add(entity);
      this.loadedEntityIds.add(entity.id);

      const renderable = this.renderableFactory.create(entity, profile);
      renderable.computedHeight = computedHeight;
      if (!object.static && !isInsideBoundary(position, seed.center, seed.maxBoundaryRadius)) {
        renderable.visible = false;
      }

      this.renderablesByEntityId.set(entity.id, renderable);
      this.worldLayer.addRenderable(renderable);
      entityCount += 1;
      renderableCount += 1;
    });

    const asteroidResult = expandAsteroidGroups({
      groups: seed.asteroidGroups,
      centerPosition: seed.center,
      boundaryRadius: seed.maxBoundaryRadius,
      entityManager: this.entityManager,
      profileRegistry: this.profileRegistry,
      renderableFactory: this.renderableFactory,
      worldLayer: this.worldLayer,
      renderablesByEntityId: this.renderablesByEntityId,
      parentPositions: resolvedPositions,
      logWarning,
      logError,
    });

    entityCount += asteroidResult.asteroidCount;
    renderableCount += asteroidResult.asteroidCount;

    const systemId = seed.systemId;
    const loadTimeMs = performance.now() - startedAt;

    return {
      systemId,
      entityCount,
      renderableCount,
      asteroidCount: asteroidResult.asteroidCount,
      warnings,
      errors,
      loadTimeMs,
    };
  }

  /** Rozładowuje aktualny system — czyści EntityManager, WorldLayer, renderables. */
  public unloadCurrentSystem(): void {
    this.loadedEntityIds.forEach((entityId) => {
      this.entityManager.remove(entityId);
      this.renderablesByEntityId.delete(entityId);
      this.worldLayer.removeRenderable(entityId);
    });
    this.loadedEntityIds.clear();

    this.entityManager.getAll().forEach((entity) => {
      this.entityManager.remove(entity.id);
      this.renderablesByEntityId.delete(entity.id);
      this.worldLayer.removeRenderable(entity.id);
    });
  }

  private finishLoad(
    url: string,
    startedAt: number,
    warnings: string[],
    errors: string[],
    entityCount: number,
    renderableCount: number,
  ): SystemLoadResult {
    return {
      systemId: this.deriveSystemId(url),
      entityCount,
      renderableCount,
      asteroidCount: 0,
      warnings,
      errors,
      loadTimeMs: performance.now() - startedAt,
    };
  }

  private deriveSystemId(url: string): string {
    const fileName = url.split('/').filter(Boolean).pop() ?? '';
    return fileName.endsWith('.json') ? fileName.slice(0, -5) : fileName;
  }

  private resolveProfile(object: SeedObject, logWarning: (message: string) => void): VisualProfile {
    const profile = this.profileRegistry.get(object.profileId);
    if (profile && profile.category === SEED_TYPE_TO_CATEGORY[object.type]) {
      return profile;
    }

    const fallbackId = `fallback-${object.type}-${object.profileId}`;
    const cachedFallback = this.fallbackProfiles.get(fallbackId);
    if (cachedFallback) {
      if (!profile) {
        logWarning(`Missing profile "${object.profileId}" for object "${object.id}", using fallback.`);
      }
      return cachedFallback;
    }

    if (!profile) {
      logWarning(`Missing profile "${object.profileId}" for object "${object.id}", using fallback.`);
    } else {
      logWarning(`Profile "${object.profileId}" has category mismatch for object "${object.id}", using fallback.`);
    }

    const fallback = createFallbackProfile(object.type, fallbackId);
    this.fallbackProfiles.set(fallbackId, fallback);
    return fallback;
  }

  private computeResolvedPositions(seed: SystemSeed, logError: (message: string) => void): Map<string, Vector2> {
    const resolved = new Map<string, Vector2>();
    const resolving = new Set<string>();
    const objectMap = new Map(seed.objects.map((object) => [object.id, object] as const));

    const resolveObject = (object: SeedObject): Vector2 | null => {
      const existing = resolved.get(object.id);
      if (existing) {
        return existing;
      }

      if (resolving.has(object.id)) {
        logError(`Orbit cycle detected while resolving object "${object.id}".`);
        return null;
      }

      resolving.add(object.id);

      const parentPosition =
        object.orbitAround === null
          ? seed.center
          : objectMap.has(object.orbitAround)
            ? resolveObject(objectMap.get(object.orbitAround) as SeedObject)
            : null;

      if (!parentPosition) {
        logError(`Missing orbitAround parent "${object.orbitAround}" for object "${object.id}".`);
        resolving.delete(object.id);
        return null;
      }

      const position = computeOrbitPosition(parentPosition, object.orbitRadius, object.orbitPhase);
      resolved.set(object.id, position);
      resolving.delete(object.id);
      return position;
    };

    seed.objects.forEach((object) => {
      resolveObject(object);
    });

    return resolved;
  }
}
