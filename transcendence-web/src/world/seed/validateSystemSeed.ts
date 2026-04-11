import type { Vector2 } from '@/types/common';
import { ASTEROID_BASE_HEIGHT, SEED_OBJECT_BASE_HEIGHT } from './seedTypeMapping';
import type { AsteroidGroupDef, SeedObject, SeedObjectType, SystemSeed } from './seedTypes';

export interface SeedValidationResult {
  valid: boolean;
  seed: SystemSeed | null;
  warnings: string[];
  errors: string[];
}

const VALID_SEED_OBJECT_TYPES = new Set<SeedObjectType>([
  'star',
  'planet',
  'moon',
  'gate',
  'station-wreck',
  'station',
  'container',
  'ship-wreck',
  'npc-ship',
  'player-ship',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isVector2(value: unknown): value is Vector2 {
  return (
    isRecord(value) &&
    typeof value.x === 'number' &&
    Number.isFinite(value.x) &&
    typeof value.y === 'number' &&
    Number.isFinite(value.y)
  );
}

function normalizePhase(phase: number): number {
  const normalized = phase % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function getBaseHeightForType(type: SeedObjectType): number {
  return SEED_OBJECT_BASE_HEIGHT[type];
}

function makeError(errors: string[], message: string): void {
  errors.push(`[SystemSeedLoader] ${message}`);
}

function makeWarning(warnings: string[], message: string): void {
  warnings.push(`[SystemSeedLoader] ${message}`);
}

export function validateSystemSeed(raw: unknown): SeedValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!isRecord(raw)) {
    makeError(errors, 'Invalid seed: expected object.');
    return { valid: false, seed: null, warnings, errors };
  }

  if (raw.schemaVersion !== 1) {
    makeError(errors, 'Unsupported schemaVersion. Expected 1.');
    return { valid: false, seed: null, warnings, errors };
  }

  if (typeof raw.systemId !== 'string' || raw.systemId.trim().length === 0) {
    makeError(errors, 'Invalid seed: systemId is missing.');
    return { valid: false, seed: null, warnings, errors };
  }

  if (typeof raw.name !== 'string' || raw.name.trim().length === 0) {
    makeError(errors, 'Invalid seed: name is missing.');
    return { valid: false, seed: null, warnings, errors };
  }

  if (!isVector2(raw.center)) {
    makeError(errors, 'Invalid seed: center must be a Vector2.');
    return { valid: false, seed: null, warnings, errors };
  }

  if (typeof raw.informationalBoundaryRadius !== 'number' || raw.informationalBoundaryRadius <= 0) {
    makeError(errors, 'Invalid seed: informationalBoundaryRadius must be > 0.');
    return { valid: false, seed: null, warnings, errors };
  }

  if (typeof raw.maxBoundaryRadius !== 'number' || raw.maxBoundaryRadius <= 0) {
    makeError(errors, 'Invalid seed: maxBoundaryRadius must be > 0.');
    return { valid: false, seed: null, warnings, errors };
  }

  if (!Array.isArray(raw.objects)) {
    makeError(errors, 'Invalid seed: objects must be an array.');
    return { valid: false, seed: null, warnings, errors };
  }

  if (!Array.isArray(raw.asteroidGroups)) {
    makeError(errors, 'Invalid seed: asteroidGroups must be an array.');
    return { valid: false, seed: null, warnings, errors };
  }

  const validatedObjects: SeedObject[] = [];
  const seenObjectIds = new Set<string>();

  raw.objects.forEach((candidate, index) => {
    if (!isRecord(candidate)) {
      makeWarning(warnings, `Skipping object at index ${index}: expected object.`);
      return;
    }

    if (typeof candidate.id !== 'string' || candidate.id.trim().length === 0) {
      makeWarning(warnings, `Skipping object at index ${index}: invalid id.`);
      return;
    }

    if (seenObjectIds.has(candidate.id)) {
      makeError(errors, `Duplicate object id "${candidate.id}" detected, skipping entry.`);
      return;
    }

    if (typeof candidate.type !== 'string' || !VALID_SEED_OBJECT_TYPES.has(candidate.type as SeedObjectType)) {
      makeWarning(warnings, `Skipping object "${candidate.id}": invalid type.`);
      return;
    }

    if (typeof candidate.profileId !== 'string' || candidate.profileId.trim().length === 0) {
      makeWarning(warnings, `Skipping object "${candidate.id}": profileId is missing.`);
      return;
    }

    if (typeof candidate.orbitRadius !== 'number' || !Number.isFinite(candidate.orbitRadius) || candidate.orbitRadius < 0) {
      makeWarning(warnings, `Skipping object "${candidate.id}": orbitRadius must be >= 0.`);
      return;
    }

    if (typeof candidate.orbitPhase !== 'number' || !Number.isFinite(candidate.orbitPhase)) {
      makeWarning(warnings, `Skipping object "${candidate.id}": orbitPhase must be a number.`);
      return;
    }

    if (candidate.orbitAround !== null && typeof candidate.orbitAround !== 'string') {
      makeWarning(warnings, `Skipping object "${candidate.id}": orbitAround must be a string or null.`);
      return;
    }

    if (typeof candidate.static !== 'boolean') {
      makeWarning(warnings, `Skipping object "${candidate.id}": static must be a boolean.`);
      return;
    }

    const type = candidate.type as SeedObjectType;
    const baseHeight = getBaseHeightForType(type);
    let height = baseHeight;

    if (typeof candidate.height === 'number' && Number.isFinite(candidate.height) && candidate.height > 0) {
      height = candidate.height;
    } else {
      makeWarning(warnings, `Object "${candidate.id}" has invalid height, using base value ${baseHeight}.`);
    }

    if (type === 'player-ship' && height < SEED_OBJECT_BASE_HEIGHT['player-ship']) {
      makeWarning(warnings, `Object "${candidate.id}" is player-ship with height < 11, forcing 11.`);
      height = SEED_OBJECT_BASE_HEIGHT['player-ship'];
    }

    seenObjectIds.add(candidate.id);
    validatedObjects.push({
      id: candidate.id,
      type,
      profileId: candidate.profileId,
      orbitRadius: candidate.orbitRadius,
      orbitPhase: normalizePhase(candidate.orbitPhase),
      orbitAround: candidate.orbitAround ?? null,
      static: candidate.static,
      height,
    });
  });

  const validatedObjectMap = new Map(validatedObjects.map((object) => [object.id, object] as const));
  const keptObjectIds = new Set<string>();
  const rejectedObjectIds = new Set<string>();
  const resolving = new Set<string>();

  const validateChain = (object: SeedObject): boolean => {
    if (keptObjectIds.has(object.id)) {
      return true;
    }

    if (rejectedObjectIds.has(object.id)) {
      return false;
    }

    if (resolving.has(object.id)) {
      const cycleStart = Array.from(resolving).indexOf(object.id);
      const cycleMembers = Array.from(resolving).slice(cycleStart >= 0 ? cycleStart : 0);
      cycleMembers.forEach((cycleId) => {
        rejectedObjectIds.add(cycleId);
        makeError(errors, `Orbit cycle detected for object "${cycleId}".`);
      });
      resolving.clear();
      return false;
    }

    resolving.add(object.id);

    if (object.orbitAround !== null) {
      const parent = validatedObjectMap.get(object.orbitAround);
      if (!parent) {
        rejectedObjectIds.add(object.id);
        makeError(errors, `Missing orbitAround parent "${object.orbitAround}" for object "${object.id}".`);
        resolving.delete(object.id);
        return false;
      }

      if (!validateChain(parent)) {
        rejectedObjectIds.add(object.id);
        makeError(errors, `Skipping object "${object.id}" because its orbitAround chain is invalid.`);
        resolving.delete(object.id);
        return false;
      }
    }

    resolving.delete(object.id);
    keptObjectIds.add(object.id);
    return true;
  };

  const filteredObjects = validatedObjects.filter((object) => validateChain(object));

  const validatedGroups: AsteroidGroupDef[] = [];
  const seenGroupIds = new Set<string>();
  const usedBeltIndices = new Set<number>();

  raw.asteroidGroups.forEach((candidate, index) => {
    if (!isRecord(candidate)) {
      makeWarning(warnings, `Skipping asteroid group at index ${index}: expected object.`);
      return;
    }

    if (typeof candidate.id !== 'string' || candidate.id.trim().length === 0) {
      makeWarning(warnings, `Skipping asteroid group at index ${index}: invalid id.`);
      return;
    }

    if (seenGroupIds.has(candidate.id)) {
      makeWarning(warnings, `Skipping asteroid group "${candidate.id}": duplicate id.`);
      return;
    }

    if (typeof candidate.profileId !== 'string' || candidate.profileId.trim().length === 0) {
      makeWarning(warnings, `Skipping asteroid group "${candidate.id}": profileId is missing.`);
      return;
    }

    if (typeof candidate.orbitRadius !== 'number' || !Number.isFinite(candidate.orbitRadius) || candidate.orbitRadius < 0) {
      makeWarning(warnings, `Skipping asteroid group "${candidate.id}": orbitRadius must be >= 0.`);
      return;
    }

    if (typeof candidate.orbitPhase !== 'number' || !Number.isFinite(candidate.orbitPhase)) {
      makeWarning(warnings, `Skipping asteroid group "${candidate.id}": orbitPhase must be a number.`);
      return;
    }

    if (candidate.orbitAround !== undefined && candidate.orbitAround !== null && typeof candidate.orbitAround !== 'string') {
      makeWarning(warnings, `Skipping asteroid group "${candidate.id}": orbitAround must be a string or null.`);
      return;
    }

    if (typeof candidate.length !== 'number' || !Number.isFinite(candidate.length) || candidate.length <= 0) {
      makeWarning(warnings, `Skipping asteroid group "${candidate.id}": length must be > 0.`);
      return;
    }

    if (typeof candidate.width !== 'number' || !Number.isFinite(candidate.width) || candidate.width <= 0) {
      makeWarning(warnings, `Skipping asteroid group "${candidate.id}": width must be > 0.`);
      return;
    }

    const countValue = typeof candidate.count === 'number' && Number.isFinite(candidate.count) ? candidate.count : undefined;
    const densityValue =
      typeof candidate.density === 'number' && Number.isFinite(candidate.density) ? candidate.density : undefined;

    if (countValue !== undefined && countValue <= 0) {
      if (densityValue === undefined || densityValue <= 0) {
        makeWarning(warnings, `Skipping asteroid group "${candidate.id}": count and density are invalid.`);
        return;
      }
    }

    if (densityValue !== undefined && densityValue <= 0) {
      if (countValue === undefined) {
        makeWarning(warnings, `Skipping asteroid group "${candidate.id}": density must be > 0 when count is not provided.`);
        return;
      }
    }

    let beltIndex = 0;
    if (typeof candidate.beltIndex === 'number' && Number.isInteger(candidate.beltIndex) && candidate.beltIndex > 0) {
      beltIndex = candidate.beltIndex;
    } else {
      beltIndex = validatedGroups.length + 1;
      makeWarning(warnings, `Asteroid group "${candidate.id}" has invalid beltIndex, assigning ${beltIndex}.`);
    }

    while (usedBeltIndices.has(beltIndex)) {
      beltIndex += 1;
      makeWarning(warnings, `Asteroid group "${candidate.id}" has duplicate beltIndex, assigning ${beltIndex}.`);
    }

    seenGroupIds.add(candidate.id);
    usedBeltIndices.add(beltIndex);
    validatedGroups.push({
      id: candidate.id,
      orbitRadius: candidate.orbitRadius,
      orbitPhase: normalizePhase(candidate.orbitPhase),
      orbitAround: candidate.orbitAround ?? null,
      length: candidate.length,
      width: candidate.width,
      density: densityValue,
      count: countValue,
      height:
        typeof candidate.height === 'number' && Number.isFinite(candidate.height) && candidate.height > 0
          ? candidate.height
          : ASTEROID_BASE_HEIGHT,
      beltIndex,
      profileId: candidate.profileId,
      seed: typeof candidate.seed === 'number' && Number.isFinite(candidate.seed) ? candidate.seed : undefined,
    });
  });

  const seed: SystemSeed = {
    schemaVersion: 1,
    systemId: raw.systemId,
    name: raw.name,
    center: raw.center,
    informationalBoundaryRadius: raw.informationalBoundaryRadius,
    maxBoundaryRadius: raw.maxBoundaryRadius,
    objects: filteredObjects,
    asteroidGroups: validatedGroups,
  };

  return {
    valid: true,
    seed,
    warnings,
    errors,
  };
}
