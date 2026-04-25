import type { Vector2 } from '@/types/common';
import type { Renderable } from '@/types/engine';
import type { EntityCategory } from '@entities/base/EntityCategory';
import type { EntityManager } from '@entities/base/EntityManager';
import type { VisualProfile } from '@presentation/profiles/VisualProfile';
import type { VisualProfileRegistry } from '@presentation/profiles/VisualProfileRegistry';
import type { RenderableFactory } from '@presentation/renderables/RenderableFactory';
import type { WorldLayer } from '@features/world-scene';
import { WorldEntity } from '@world/entities';
import { expandAsteroidGroups } from './expandAsteroidGroups';
import { computeOrbitPosition } from './orbitUtils';
import { SEED_TYPE_TO_CATEGORY } from './seedTypeMapping';
import type { AsteroidClusterAnchor, RuntimeSeedObjectType, SeedObject, SystemSeed } from './seedTypes';
import { validateSystemSeed } from './validateSystemSeed';

export interface SystemLoadResult {
  systemId: string;
  entityCount: number;
  renderableCount: number;
  asteroidCount: number;
  asteroidClusterAnchors: AsteroidClusterAnchor[];
  warnings: string[];
  errors: string[];
  loadTimeMs: number;
}

interface PositionedSeedObject {
  object: SeedObject;
  seedIndex: number;
  position: Vector2;
  visible: boolean;
}

interface RuntimeSpawnObject {
  id: string;
  seedType: RuntimeSeedObjectType;
  profileId: string;
  position: Vector2;
  computedHeight: number;
  isStatic: boolean;
  visible: boolean;
}

export class SystemSeedLoader {
  private currentSystemId: string | null = null;
  private readonly loadedEntityIds = new Set<string>();

  public constructor(
    private readonly entityManager: EntityManager,
    private readonly profileRegistry: VisualProfileRegistry,
    private readonly renderableFactory: RenderableFactory,
    private readonly worldLayer: WorldLayer,
    private readonly renderablesByEntityId: Map<string, Renderable>,
  ) {}

  /** Laduje seed z URL, waliduje, instancjonuje, rejestruje. */
  public async loadSystem(url: string): Promise<SystemLoadResult> {
    const startedAt = performance.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    this.unloadCurrentSystem();

    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      this.logError(errors, `Failed to fetch seed: ${url}.`);
      if (error) {
        console.error('[SystemSeedLoader] Fetch exception details:', error);
      }
      return this.buildResult('unknown', 0, 0, 0, [], warnings, errors, startedAt);
    }

    if (!response.ok) {
      this.logError(errors, `Failed to fetch seed: ${url}. HTTP ${response.status}.`);
      return this.buildResult('unknown', 0, 0, 0, [], warnings, errors, startedAt);
    }

    let rawSeed: unknown;
    try {
      rawSeed = await response.json();
    } catch (error) {
      this.logError(errors, `Failed to parse seed JSON: ${url}.`);
      if (error) {
        console.error('[SystemSeedLoader] JSON parse exception details:', error);
      }
      return this.buildResult('unknown', 0, 0, 0, [], warnings, errors, startedAt);
    }

    const validation = validateSystemSeed(rawSeed);
    validation.warnings.forEach((message) => this.logWarning(warnings, message));
    validation.errors.forEach((message) => this.logError(errors, message));

    if (!validation.valid || !validation.seed) {
      return this.buildResult('unknown', 0, 0, 0, [], warnings, errors, startedAt);
    }

    const seed = validation.seed;
    const positionedObjects = this.computeSeedObjectPositions(seed, warnings, errors);
    const parentPositions = new Map<string, Vector2>();
    positionedObjects.forEach((entry) => {
      parentPositions.set(entry.object.id, entry.position);
    });

    const runtimeObjects: RuntimeSpawnObject[] = positionedObjects.map((entry) => ({
      id: entry.object.id,
      seedType: entry.object.type,
      profileId: entry.object.profileId,
      position: entry.position,
      computedHeight: entry.object.height + entry.seedIndex / 10000,
      isStatic: entry.object.static,
      visible: entry.visible,
    }));

    const asteroidExpansion = expandAsteroidGroups({
      groups: seed.asteroidGroups,
      systemCenter: seed.center,
      parentPositions,
    });

    const asteroidClusterAnchors = asteroidExpansion.clusterAnchors.map((anchor) => ({
      anchorId: anchor.anchorId,
      clusterId: anchor.clusterId,
      position: {
        x: anchor.position.x,
        y: anchor.position.y,
      },
    }));

    asteroidExpansion.warnings.forEach((message) => this.logWarning(warnings, message));

    asteroidExpansion.asteroids.forEach((asteroid) => {
      const distance = this.getDistance(seed.center, asteroid.position);
      if (distance > seed.maxBoundaryRadius) {
        this.logWarning(
          warnings,
          `V16: Static asteroid "${asteroid.id}" is outside maxBoundaryRadius and was skipped.`,
        );
        return;
      }

      runtimeObjects.push({
        id: asteroid.id,
        seedType: asteroid.type,
        profileId: asteroid.profileId,
        position: asteroid.position,
        computedHeight: asteroid.computedHeight,
        isStatic: true,
        visible: true,
      });
    });

    const seenRuntimeIds = new Set<string>();
    let asteroidCount = 0;

    runtimeObjects.forEach((object) => {
      if (seenRuntimeIds.has(object.id) || this.entityManager.has(object.id)) {
        this.logError(errors, `Duplicate runtime entity id "${object.id}". Entry skipped.`);
        return;
      }

      seenRuntimeIds.add(object.id);

      const category: EntityCategory =
        object.seedType === 'asteroid' ? 'celestial' : SEED_TYPE_TO_CATEGORY[object.seedType];

      const profileFromRegistry = this.profileRegistry.get(object.profileId);
      if (!profileFromRegistry) {
        this.logWarning(
          warnings,
          `Missing visual profile "${object.profileId}" for "${object.id}". Using procedural fallback.`,
        );
      }

      const profile =
        profileFromRegistry ?? this.createFallbackProfile(object.profileId, category, object.seedType);

      const entity = new WorldEntity({
        id: object.id,
        category,
        seedType: object.seedType,
        position: object.position,
        width: profile.size.width,
        height: profile.size.height,
        computedHeight: object.computedHeight,
        isStatic: object.isStatic,
        profileId: object.profileId,
      });

      this.entityManager.add(entity);

      const renderable = this.renderableFactory.create(entity, profile);
      renderable.computedHeight = object.computedHeight;
      renderable.visible = object.visible;

      this.renderablesByEntityId.set(entity.id, renderable);
      this.worldLayer.addRenderable(renderable);
      this.loadedEntityIds.add(entity.id);

      if (object.seedType === 'asteroid') {
        asteroidCount += 1;
      }
    });

    this.currentSystemId = seed.systemId;

    return this.buildResult(
      seed.systemId,
      this.entityManager.size,
      this.renderablesByEntityId.size,
      asteroidCount,
      asteroidClusterAnchors,
      warnings,
      errors,
      startedAt,
    );
  }

  /** Rozladowuje aktualny system — czysci EntityManager, WorldLayer, renderables. */
  public unloadCurrentSystem(): void {
    this.loadedEntityIds.forEach((entityId) => {
      this.entityManager.remove(entityId);
      this.renderablesByEntityId.delete(entityId);
      this.worldLayer.removeRenderable(entityId);
    });

    this.loadedEntityIds.clear();
    this.currentSystemId = null;
  }

  private computeSeedObjectPositions(
    seed: SystemSeed,
    warnings: string[],
    errors: string[],
  ): PositionedSeedObject[] {
    const unresolved = seed.objects.map((object, seedIndex) => ({ object, seedIndex }));
    const resolved = new Map<string, Vector2>();
    const positioned: PositionedSeedObject[] = [];

    let progress = true;
    while (unresolved.length > 0 && progress) {
      progress = false;

      for (let i = 0; i < unresolved.length; ) {
        const current = unresolved[i];
        const parentPosition =
          current.object.orbitAround === null
            ? seed.center
            : resolved.get(current.object.orbitAround) ?? null;

        if (!parentPosition) {
          i += 1;
          continue;
        }

        const position = computeOrbitPosition(
          parentPosition,
          current.object.orbitRadius,
          current.object.orbitPhase,
        );

        const distance = this.getDistance(seed.center, position);

        if (distance > seed.maxBoundaryRadius && current.object.static) {
          this.logWarning(
            warnings,
            `V16: Static object "${current.object.id}" is outside maxBoundaryRadius and was skipped.`,
          );

          unresolved.splice(i, 1);
          progress = true;
          continue;
        }

        const visible = !(distance > seed.maxBoundaryRadius && !current.object.static);
        if (!visible) {
          this.logWarning(
            warnings,
            `V17: Dynamic object "${current.object.id}" is outside maxBoundaryRadius and was created hidden.`,
          );
        }

        resolved.set(current.object.id, position);
        positioned.push({
          object: current.object,
          seedIndex: current.seedIndex,
          position,
          visible,
        });

        unresolved.splice(i, 1);
        progress = true;
      }
    }

    unresolved.forEach((entry) => {
      this.logError(
        errors,
        `Unable to resolve orbit position for "${entry.object.id}" (missing parent chain). Entry skipped.`,
      );
    });

    return positioned;
  }

  private createFallbackProfile(
    profileId: string,
    category: EntityCategory,
    seedType: RuntimeSeedObjectType,
  ): VisualProfile {
    const colorByCategory: Record<EntityCategory, string> = {
      ship: '#4ac6ff',
      station: '#f7c55d',
      gate: '#9f86ff',
      wreck: '#cc6677',
      projectile: '#ffffff',
      celestial: '#70d67f',
      environment: '#d0d0d0',
    };

    return {
      profileId: `fallback-${profileId}`,
      category,
      size: { width: 40, height: 28 },
      cullRadius: 26,
      source: {
        type: 'procedural',
        drawFn: (ctx, width, height) => {
          ctx.fillStyle = colorByCategory[category];
          ctx.globalAlpha = 0.8;
          ctx.fillRect(-width / 2, -height / 2, width, height);
          ctx.globalAlpha = 1;

          ctx.strokeStyle = '#111111';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-width / 2, -height / 2, width, height);

          ctx.fillStyle = '#111111';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '9px monospace';
          ctx.fillText(seedType, 0, 0);
        },
      },
    };
  }

  private getDistance(a: Vector2, b: Vector2): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private buildResult(
    systemId: string,
    entityCount: number,
    renderableCount: number,
    asteroidCount: number,
    asteroidClusterAnchors: AsteroidClusterAnchor[],
    warnings: string[],
    errors: string[],
    startedAt: number,
  ): SystemLoadResult {
    return {
      systemId,
      entityCount,
      renderableCount,
      asteroidCount,
      asteroidClusterAnchors,
      warnings,
      errors,
      loadTimeMs: Math.round(performance.now() - startedAt),
    };
  }

  private logWarning(target: string[], message: string): void {
    const entry = `[SystemSeedLoader] ${message}`;
    target.push(entry);
    console.warn(entry);
  }

  private logError(target: string[], message: string): void {
    const entry = `[SystemSeedLoader] ${message}`;
    target.push(entry);
    console.error(entry);
  }
}
