import type { AssetLoader } from '@assets/AssetLoader';
import type { EntityManager } from '@entities/base';
import type { Camera } from '@engine/renderer/Camera';
import type { OffscreenCache } from '@presentation/cache/OffscreenCache';
import { EntityRenderable } from '@presentation/renderables';
import { FLIGHT_KEY_MAP } from '@systems/flight/FlightActions';
import type { PlayerShipEntity } from '@world/entities';
import type { SystemLoadResult } from '@world/seed';
import type { DevOverlayLike, DevOverlaySectionLike } from './contracts';

interface RegisterAppShellDevOverlayOptions {
  overlay: DevOverlayLike;
  entityManager: EntityManager;
  worldLayer: {
    renderableCount: number;
    lastVisibleCount: number;
    lastCulledCount: number;
  };
  camera: Camera;
  cache: OffscreenCache;
  assetLoader: AssetLoader;
  getCurrentSystemId: () => string;
  getLastSystemLoadResult: () => SystemLoadResult | null;
  getAsteroidCount: () => number;
  getSmoothedFps: () => number;
  getFrameTimeMs: () => number;
  getActiveSpriteTestProfileId: () => string | null;
  getSpriteProfileIds: () => string[];
  spawnNextSpriteTestEntity: () => void;
  clearSpriteTestEntity: () => void;
  getPlayerShipEntity: () => PlayerShipEntity | null;
  isFlightAssistHeld: () => boolean;
  readDevTestEntityEnabled: () => boolean;
  setDevTestEntityEnabled: (enabled: boolean) => void;
  getDevFlightMode: () => boolean;
  setDevFlightMode: (enabled: boolean) => void;
  getPixelSnapStatic: () => boolean;
  setPixelSnapStatic: (enabled: boolean) => void;
  registerDevSpawnSection: (overlay: DevOverlayLike) => void;
  onDevFlagsSectionReady: (section: DevOverlaySectionLike) => void;
}

export function registerAppShellDevOverlay({
  overlay,
  entityManager,
  worldLayer,
  camera,
  cache,
  assetLoader,
  getCurrentSystemId,
  getLastSystemLoadResult,
  getAsteroidCount,
  getSmoothedFps,
  getFrameTimeMs,
  getActiveSpriteTestProfileId,
  getSpriteProfileIds,
  spawnNextSpriteTestEntity,
  clearSpriteTestEntity,
  getPlayerShipEntity,
  isFlightAssistHeld,
  readDevTestEntityEnabled,
  setDevTestEntityEnabled,
  getDevFlightMode,
  setDevFlightMode,
  getPixelSnapStatic,
  setPixelSnapStatic,
  registerDevSpawnSection,
  onDevFlagsSectionReady,
}: RegisterAppShellDevOverlayOptions): void {
  const entitiesSection = overlay.registerSection('entities', 'Entities');
  entitiesSection.registerMetric('total', 'total', () => entityManager.size);

  const categories = [
    'ship',
    'station',
    'gate',
    'wreck',
    'projectile',
    'celestial',
    'environment',
  ] as const;
  categories.forEach((category) => {
    entitiesSection.registerMetric(category, category, () => entityManager.getByCategory(category).length);
  });

  const renderSection = overlay.registerSection('render', 'Render');
  renderSection.registerMetric('renderables', 'renderables', () => worldLayer.renderableCount);
  renderSection.registerMetric('visible', 'visible', () => worldLayer.lastVisibleCount);
  renderSection.registerMetric('culled', 'culled', () => worldLayer.lastCulledCount);

  const cameraSection = overlay.registerSection('camera', 'Camera');
  cameraSection.registerMetric('x', 'x', () => camera.position.x.toFixed(1));
  cameraSection.registerMetric('y', 'y', () => camera.position.y.toFixed(1));
  cameraSection.registerMetric('zoom', 'zoom', () => camera.zoom.toFixed(2));

  const cacheSection = overlay.registerSection('cache', 'Cache');
  cacheSection.registerMetric('used', 'used', () => {
    const bytes = cache.entityCacheBytes;
    const mb = bytes / (1024 * 1024);

    if (mb < 0.1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${mb.toFixed(1)} MB`;
  });
  cacheSection.registerMetric('limit', 'limit', () => `${(cache.entityCacheLimit / (1024 * 1024)).toFixed(0)} MB`);
  cacheSection.registerMetric('percent', 'percent', () => `${cache.entityCachePercent.toFixed(1)}%`);
  cacheSection.registerMetric('entries', 'entries', () => cache.size);

  const assetsSection = overlay.registerSection('assets', 'Assets');
  assetsSection.registerMetric('loaded', 'loaded', () => assetLoader.stats.loaded);
  assetsSection.registerMetric('total', 'total', () => assetLoader.stats.total);
  assetsSection.registerMetric('failed', 'failed', () => assetLoader.stats.failed);

  const systemSection = overlay.registerSection('system', 'System');
  systemSection.registerMetric('system', 'system', getCurrentSystemId);
  systemSection.registerMetric('entities', 'entities', () => entityManager.size);
  systemSection.registerMetric('asteroids', 'asteroids', getAsteroidCount);
  systemSection.registerMetric('load-time', 'load time', () => {
    const result = getLastSystemLoadResult();
    if (!result) {
      return '-';
    }

    return `${result.loadTimeMs} ms`;
  });
  systemSection.registerMetric('fps', 'fps', () => {
    const fps = getSmoothedFps();
    return fps > 0 ? fps.toFixed(1) : '-';
  });
  systemSection.registerMetric('frame-ms', 'frame ms', () => {
    const frameTimeMs = getFrameTimeMs();
    return frameTimeMs > 0 ? `${frameTimeMs.toFixed(2)} ms` : '-';
  });
  systemSection.registerMetric('warnings', 'warnings', () => getLastSystemLoadResult()?.warnings.length ?? 0);
  systemSection.registerMetric('errors', 'errors', () => getLastSystemLoadResult()?.errors.length ?? 0);

  const spriteTestSection = overlay.registerSection('sprite-test', 'Sprite Test');
  spriteTestSection.registerMetric('active', 'active', () => getActiveSpriteTestProfileId() ?? '-');
  spriteTestSection.registerMetric('available', 'available', () => getSpriteProfileIds().length);
  spriteTestSection.registerControl('spawn-next', 'Spawn next sprite', 'button', undefined, spawnNextSpriteTestEntity);
  spriteTestSection.registerControl('clear-sprite-test', 'Clear sprite test', 'button', undefined, clearSpriteTestEntity);

  const flightSection = overlay.registerSection('flight', 'Flight');
  flightSection.registerMetric('status', 'status', () =>
    getPlayerShipEntity() ? 'ready' : 'no player-ship'
  );
  flightSection.registerMetric('speed', 'speed', () => {
    const playerShipEntity = getPlayerShipEntity();
    if (!playerShipEntity) {
      return '-';
    }

    return `${playerShipEntity.speed.toFixed(1)} px/s`;
  });
  flightSection.registerMetric('heading', 'heading', () => {
    const playerShipEntity = getPlayerShipEntity();
    if (!playerShipEntity) {
      return '-';
    }

    const headingDeg = (playerShipEntity.heading * 180) / Math.PI;
    return `${headingDeg.toFixed(1)}°`;
  });
  flightSection.registerMetric('velocity', 'velocity', () => {
    const playerShipEntity = getPlayerShipEntity();
    if (!playerShipEntity) {
      return '-';
    }

    const velocity = playerShipEntity.currentVelocity;
    return `(${velocity.x.toFixed(1)}, ${velocity.y.toFixed(1)})`;
  });
  flightSection.registerMetric('acceleration', 'acceleration', () => {
    const playerShipEntity = getPlayerShipEntity();
    if (!playerShipEntity) {
      return '-';
    }

    const acceleration = playerShipEntity.acceleration;
    return `(${acceleration.x.toFixed(1)}, ${acceleration.y.toFixed(1)})`;
  });
  flightSection.registerMetric('flight-assist', 'flight assist', () =>
    isFlightAssistHeld() ? `AUTO-STOP (HOLD: ${FLIGHT_KEY_MAP['toggle-flight-assist']})` : 'OFF'
  );
  flightSection.registerMetric('position', 'position', () => {
    const playerShipEntity = getPlayerShipEntity();
    if (!playerShipEntity) {
      return '-';
    }

    return `(${playerShipEntity.position.x.toFixed(1)}, ${playerShipEntity.position.y.toFixed(1)})`;
  });

  const devFlagsSection = overlay.registerSection('dev-flags', 'Dev Flags');
  onDevFlagsSectionReady(devFlagsSection);
  devFlagsSection.registerControl(
    'test-entity',
    'Test entity',
    'checkbox',
    readDevTestEntityEnabled(),
    (enabled: boolean) => {
      setDevTestEntityEnabled(enabled);
    },
  );
  devFlagsSection.registerControl(
    'flight-mode',
    'Flight mode',
    'checkbox',
    getDevFlightMode(),
    (enabled: boolean) => {
      const playerShipEntity = getPlayerShipEntity();
      setDevFlightMode(enabled && playerShipEntity !== null);
    },
  );
  devFlagsSection.registerControl(
    'pixel-snap-static',
    'Pixel snap static',
    'checkbox',
    getPixelSnapStatic(),
    (enabled: boolean) => {
      setPixelSnapStatic(enabled);
      EntityRenderable.pixelSnapStatic = enabled;
    },
  );

  registerDevSpawnSection(overlay);
}
