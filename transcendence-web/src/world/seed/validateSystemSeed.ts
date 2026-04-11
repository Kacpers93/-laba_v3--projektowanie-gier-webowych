import type { AsteroidGroupDef, SeedObject, SeedObjectType, SystemSeed } from './seedTypes';
import { BASE_HEIGHT_BY_SEED_TYPE, SEED_OBJECT_TYPES } from './seedTypes';

export interface SeedValidationResult {
  valid: boolean;
  seed: SystemSeed | null;
  warnings: string[];
  errors: string[];
}

const SEED_TYPE_SET = new Set<SeedObjectType>(SEED_OBJECT_TYPES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isVector2(value: unknown): value is { x: number; y: number } {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.x === 'number' &&
    Number.isFinite(value.x) &&
    typeof value.y === 'number' &&
    Number.isFinite(value.y)
  );
}

function normalizeOrbitPhase(value: number): number {
  const mod = value % 360;
  return mod >= 0 ? mod : mod + 360;
}

function detectCycle(objectById: ReadonlyMap<string, SeedObject>, startId: string): boolean {
  const visited = new Set<string>();
  let currentId: string | null = startId;

  while (currentId !== null) {
    if (visited.has(currentId)) {
      return true;
    }

    visited.add(currentId);
    const current = objectById.get(currentId);
    if (!current) {
      return false;
    }

    currentId = current.orbitAround;
  }

  return false;
}

function getNextAvailableBeltIndex(used: Set<number>, start: number): number {
  let index = Math.max(1, Math.trunc(start));
  while (used.has(index)) {
    index += 1;
  }

  return index;
}

export function validateSystemSeed(raw: unknown): SeedValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!isRecord(raw)) {
    errors.push('V1: Seed payload is not an object.');
    return { valid: false, seed: null, warnings, errors };
  }

  const schemaVersion = raw.schemaVersion;
  const systemId = raw.systemId;
  const name = raw.name;
  const center = raw.center;
  const informationalBoundaryRadius = raw.informationalBoundaryRadius;
  const maxBoundaryRadius = raw.maxBoundaryRadius;
  const objectsRaw = raw.objects;

  if (schemaVersion !== 1) {
    errors.push('V1: schemaVersion must be 1.');
  }

  if (typeof systemId !== 'string' || systemId.trim() === '') {
    errors.push('V2: Missing or invalid systemId.');
  }

  if (typeof name !== 'string' || name.trim() === '') {
    errors.push('V2: Missing or invalid name.');
  }

  if (!isVector2(center)) {
    errors.push('V3: center must be a { x, y } vector.');
  }

  if (
    typeof informationalBoundaryRadius !== 'number' ||
    !Number.isFinite(informationalBoundaryRadius) ||
    informationalBoundaryRadius <= 0
  ) {
    errors.push('V4: informationalBoundaryRadius must be > 0.');
  }

  if (
    typeof maxBoundaryRadius !== 'number' ||
    !Number.isFinite(maxBoundaryRadius) ||
    maxBoundaryRadius <= 0
  ) {
    errors.push('V5: maxBoundaryRadius must be > 0.');
  }

  if (!Array.isArray(objectsRaw)) {
    errors.push('V6: objects must be an array.');
  }

  if (errors.length > 0) {
    return { valid: false, seed: null, warnings, errors };
  }

  const safeObjectsRaw = objectsRaw as unknown[];
  const safeSystemId = systemId as string;
  const safeName = name as string;
  const safeCenter = center as { x: number; y: number };
  const safeInformationalBoundaryRadius = informationalBoundaryRadius as number;
  const safeMaxBoundaryRadius = maxBoundaryRadius as number;

  const parsedObjects: SeedObject[] = [];
  const seenObjectIds = new Set<string>();

  safeObjectsRaw.forEach((entry: unknown, index: number) => {
    if (!isRecord(entry)) {
      warnings.push(`Object at index ${index} is not an object and was skipped.`);
      return;
    }

    const id = typeof entry.id === 'string' ? entry.id.trim() : '';
    if (!id) {
      warnings.push(`Object at index ${index} has empty id and was skipped.`);
      return;
    }

    if (seenObjectIds.has(id)) {
      errors.push(`V7: Duplicate object id "${id}". Second entry skipped.`);
      return;
    }

    const type = typeof entry.type === 'string' ? entry.type : '';
    if (!SEED_TYPE_SET.has(type as SeedObjectType)) {
      warnings.push(`V8: Object "${id}" has unsupported type "${String(type)}" and was skipped.`);
      return;
    }

    const profileId = typeof entry.profileId === 'string' ? entry.profileId.trim() : '';
    if (!profileId) {
      warnings.push(`V9: Object "${id}" has empty profileId and was skipped.`);
      return;
    }

    const orbitRadius = typeof entry.orbitRadius === 'number' ? entry.orbitRadius : Number.NaN;
    if (!Number.isFinite(orbitRadius) || orbitRadius < 0) {
      warnings.push(`V10: Object "${id}" has invalid orbitRadius and was skipped.`);
      return;
    }

    const rawOrbitPhase = typeof entry.orbitPhase === 'number' ? entry.orbitPhase : Number.NaN;
    if (!Number.isFinite(rawOrbitPhase)) {
      warnings.push(`Object "${id}" has invalid orbitPhase and was skipped.`);
      return;
    }

    const normalizedOrbitPhase = normalizeOrbitPhase(rawOrbitPhase);
    if (normalizedOrbitPhase !== rawOrbitPhase) {
      warnings.push(
        `V11: Object "${id}" had orbitPhase=${rawOrbitPhase}. Normalized to ${normalizedOrbitPhase}.`,
      );
    }

    let orbitAround: string | null;
    if (entry.orbitAround === null || entry.orbitAround === undefined || entry.orbitAround === '') {
      orbitAround = null;
    } else if (typeof entry.orbitAround === 'string') {
      orbitAround = entry.orbitAround;
    } else {
      warnings.push(`Object "${id}" has invalid orbitAround and was skipped.`);
      return;
    }

    const isStatic = typeof entry.static === 'boolean' ? entry.static : true;

    let height =
      typeof entry.height === 'number' && Number.isFinite(entry.height)
        ? entry.height
        : BASE_HEIGHT_BY_SEED_TYPE[type as SeedObjectType];

    if (height <= 0) {
      height = BASE_HEIGHT_BY_SEED_TYPE[type as SeedObjectType];
      warnings.push(`V14: Object "${id}" had height<=0. Using default ${height}.`);
    }

    if (type === 'player-ship' && height < 11) {
      height = 11;
      warnings.push(`V15: player-ship "${id}" had height<11. Forced to 11.`);
    }

    seenObjectIds.add(id);
    parsedObjects.push({
      id,
      type: type as SeedObjectType,
      profileId,
      orbitRadius,
      orbitPhase: normalizedOrbitPhase,
      orbitAround,
      static: isStatic,
      height,
    });
  });

  let parentSafeObjects = parsedObjects.filter((object) => {
    if (object.orbitAround === null) {
      return true;
    }

    if (!seenObjectIds.has(object.orbitAround)) {
      errors.push(`V12: Object "${object.id}" references missing orbitAround parent "${object.orbitAround}".`);
      return false;
    }

    return true;
  });

  const objectById = new Map(parentSafeObjects.map((object) => [object.id, object]));
  const cycleSafeObjects = parentSafeObjects.filter((object) => {
    if (!detectCycle(objectById, object.id)) {
      return true;
    }

    errors.push(`V13: Object "${object.id}" creates orbit cycle and was skipped.`);
    return false;
  });

  const missingParentAfterCycle = new Set<string>();
  parentSafeObjects = cycleSafeObjects;
  let changed = true;
  while (changed) {
    changed = false;
    const ids = new Set(parentSafeObjects.map((object) => object.id));
    parentSafeObjects = parentSafeObjects.filter((object) => {
      if (object.orbitAround === null || ids.has(object.orbitAround)) {
        return true;
      }

      if (!missingParentAfterCycle.has(object.id)) {
        errors.push(
          `V12: Object "${object.id}" lost parent "${object.orbitAround}" after cycle cleanup and was skipped.`,
        );
        missingParentAfterCycle.add(object.id);
      }

      changed = true;
      return false;
    });
  }

  const asteroidGroupsRaw = Array.isArray(raw.asteroidGroups) ? raw.asteroidGroups : [];
  if (!Array.isArray(raw.asteroidGroups)) {
    warnings.push('asteroidGroups is missing or invalid. Using empty array.');
  }

  const parsedAsteroidGroups: AsteroidGroupDef[] = [];
  const usedBeltIndexes = new Set<number>();

  asteroidGroupsRaw.forEach((entry, index) => {
    if (!isRecord(entry)) {
      warnings.push(`Asteroid group at index ${index} is not an object and was skipped.`);
      return;
    }

    const id = typeof entry.id === 'string' ? entry.id.trim() : '';
    if (!id) {
      warnings.push(`Asteroid group at index ${index} has empty id and was skipped.`);
      return;
    }

    const profileId = typeof entry.profileId === 'string' ? entry.profileId.trim() : '';
    if (!profileId) {
      warnings.push(`V20: Asteroid group "${id}" has empty profileId and was skipped.`);
      return;
    }

    const orbitRadius = typeof entry.orbitRadius === 'number' ? entry.orbitRadius : Number.NaN;
    if (!Number.isFinite(orbitRadius) || orbitRadius < 0) {
      warnings.push(`Asteroid group "${id}" has invalid orbitRadius and was skipped.`);
      return;
    }

    const rawOrbitPhase = typeof entry.orbitPhase === 'number' ? entry.orbitPhase : Number.NaN;
    if (!Number.isFinite(rawOrbitPhase)) {
      warnings.push(`Asteroid group "${id}" has invalid orbitPhase and was skipped.`);
      return;
    }

    const orbitPhase = normalizeOrbitPhase(rawOrbitPhase);
    if (orbitPhase !== rawOrbitPhase) {
      warnings.push(
        `V11: Asteroid group "${id}" had orbitPhase=${rawOrbitPhase}. Normalized to ${orbitPhase}.`,
      );
    }

    let orbitAround: string | null;
    if (entry.orbitAround === null || entry.orbitAround === undefined || entry.orbitAround === '') {
      orbitAround = null;
    } else if (typeof entry.orbitAround === 'string') {
      orbitAround = entry.orbitAround;
    } else {
      warnings.push(`Asteroid group "${id}" has invalid orbitAround and was skipped.`);
      return;
    }

    const length = typeof entry.length === 'number' ? entry.length : Number.NaN;
    const width = typeof entry.width === 'number' ? entry.width : Number.NaN;

    if (!Number.isFinite(length) || length <= 0 || !Number.isFinite(width) || width <= 0) {
      warnings.push(`Asteroid group "${id}" has invalid length/width and was skipped.`);
      return;
    }

    const rawDensity = typeof entry.density === 'number' ? entry.density : undefined;
    const density = rawDensity !== undefined && Number.isFinite(rawDensity) && rawDensity > 0 ? rawDensity : undefined;

    const rawCount = typeof entry.count === 'number' ? Math.round(entry.count) : undefined;
    let count = rawCount !== undefined && Number.isFinite(rawCount) ? rawCount : undefined;

    if (count !== undefined && count <= 0 && density === undefined) {
      warnings.push(`V18: Asteroid group "${id}" has count<=0 and no density. Group skipped.`);
      return;
    }

    if (count !== undefined && count <= 0 && density !== undefined) {
      warnings.push(`Asteroid group "${id}" has count<=0. Falling back to density.`);
      count = undefined;
    }

    if (count === undefined && density === undefined) {
      warnings.push(`V18: Asteroid group "${id}" has no valid count and no density. Group skipped.`);
      return;
    }

    const rawHeight = typeof entry.height === 'number' ? entry.height : Number.NaN;
    const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 7;

    let beltIndex =
      typeof entry.beltIndex === 'number' && Number.isFinite(entry.beltIndex)
        ? Math.round(entry.beltIndex)
        : Number.NaN;

    if (!Number.isFinite(beltIndex) || beltIndex <= 0) {
      beltIndex = getNextAvailableBeltIndex(usedBeltIndexes, 1);
      warnings.push(`Asteroid group "${id}" had invalid beltIndex. Assigned ${beltIndex}.`);
    } else if (usedBeltIndexes.has(beltIndex)) {
      const reassigned = getNextAvailableBeltIndex(usedBeltIndexes, beltIndex + 1);
      warnings.push(
        `V19: Asteroid group "${id}" duplicated beltIndex=${beltIndex}. Assigned ${reassigned}.`,
      );
      beltIndex = reassigned;
    }

    usedBeltIndexes.add(beltIndex);

    const seed = typeof entry.seed === 'number' && Number.isFinite(entry.seed) ? Math.round(entry.seed) : undefined;

    parsedAsteroidGroups.push({
      id,
      orbitRadius,
      orbitPhase,
      orbitAround,
      length,
      width,
      density,
      count,
      height,
      beltIndex,
      profileId,
      seed,
    });
  });

  const seed: SystemSeed = {
    schemaVersion: 1,
    systemId: safeSystemId.trim(),
    name: safeName.trim(),
    center: { x: safeCenter.x, y: safeCenter.y },
    informationalBoundaryRadius: safeInformationalBoundaryRadius,
    maxBoundaryRadius: safeMaxBoundaryRadius,
    objects: parentSafeObjects,
    asteroidGroups: parsedAsteroidGroups,
  };

  return {
    valid: true,
    seed,
    warnings,
    errors,
  };
}
