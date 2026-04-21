import { AudioManager } from '@engine/audio/AudioManager';
import { GameInput } from '@engine/input/GameInput';
import { InputModeManager } from '@engine/input/InputModeManager';
import { UIInput } from '@engine/input/UIInput';
import { GameLoop } from '@engine/loop/GameLoop';
import { Camera } from '@engine/renderer/Camera';
import { Renderer } from '@engine/renderer/Renderer';
import { AssetLoader } from '@assets/AssetLoader';
import { registerManifestProfiles } from '@assets/registerManifestProfiles';
import { BaseEntity, EntityManager } from '@entities/base';
import type { EntityCategory, GameEntity } from '@entities/base';
import { Vec2 } from '@physics/Vector2';
import type { AABB } from '@physics/types';
import { OffscreenCache } from '@presentation/cache/OffscreenCache';
import { VisualProfileRegistry } from '@presentation/profiles';
import type { VisualProfile } from '@presentation/profiles';
import { EntityRenderable, RenderableFactory } from '@presentation/renderables';
import { BackgroundLayer } from '@presentation/scene/BackgroundLayer';
import { DebugLayer } from '@presentation/scene/DebugLayer';
import { EffectsLayer } from '@presentation/scene/EffectsLayer';
import { ACTIVE_PARALLAX_SUBLAYERS } from '@presentation/scene/parallax-presets';
import { ParallaxLayer } from '@presentation/scene/ParallaxLayer';
import { SceneRenderer } from '@presentation/scene/SceneRenderer';
import { WorldLayer } from '@presentation/scene/WorldLayer';
import { PlayerShipEntity, WorldEntity } from '@world/entities';
import { FLIGHT_KEY_MAP } from '@systems/flight/FlightActions';
import { DEFAULT_FLIGHT_CONFIG } from '@systems/flight/flightConfig';
import {
  BASE_HEIGHT_BY_SEED_TYPE,
  computeOrbitPosition,
  SEED_TYPE_TO_CATEGORY,
  SystemSeedLoader,
} from '@world/seed';
import type { SeedObjectType, SystemLoadResult } from '@world/seed';
import type { Vector2 } from '@/types/common';
import type { Renderable } from '@/types/engine';
import { HudController } from '@ui/hud/HudController';
import { MenuController } from '@ui/menu/MenuController';
import { MenuRegistry } from '@ui/menu/MenuRegistry';
import { MenuView } from '@ui/menu/MenuView';
import {
  RADAR_DEFAULT_CONFIG,
  REACTOR_TEST_PAYLOAD,
  SHIP_STATUS_TEST_PAYLOAD,
  TARGET_EMPTY_PAYLOAD,
} from '@ui/types/hudTypes';
import type { HudContext, RadarContact } from '@ui/types/hudTypes';
import type { MenuObjectType, ObjectState } from '@ui/types/menuTypes';

const CAMERA_SPEED = 220;
const DEV_OVERLAY_UPDATE_INTERVAL = 0.25;
const DEV_TEST_ENTITY_STORAGE_KEY = 'dev-test-entity';
const DEV_TEST_ENTITY_ID = 'dev-test-ship';
const DEV_SPRITE_TEST_ENTITY_ID = 'dev-sprite-test';
const DEV_SPRITE_TEST_START_X = 140;
const DEV_SPRITE_TEST_START_Y = -90;
const SYSTEM_SEED_URL = '/world/systems/sol-001.json';
const DEV_SPAWN_DEFAULT_ORBIT_RADIUS = 300;
const DEV_SPAWN_DEFAULT_ORBIT_PHASE = 0;
const CAMERA_ZOOM_MIN = 0.5;
const CAMERA_ZOOM_MAX = 2;
const CAMERA_ZOOM_STEP = 0.015;
const CAMERA_ZOOM_LERP_RATE = 8;

type DevOverlaySelectOption = {
  value: string;
  label: string;
};

type DevOverlayLike = {
  mount(parent: HTMLElement): void;
  unmount(): void;
  toggle(): void;
  registerSection(id: string, label: string): {
    registerMetric(id: string, label: string, getter: () => string | number): void;
    registerControl(
      id: string,
      label: string,
      type: 'button',
      initialValue: undefined,
      onChange: () => void,
    ): void;
    registerControl(
      id: string,
      label: string,
      type: 'checkbox',
      initialValue: boolean,
      onChange: (value: boolean) => void,
    ): void;
    registerControl(
      id: string,
      label: string,
      type: 'number',
      initialValue: number,
      onChange: (value: number) => void,
      options?: { min?: number; max?: number; step?: number },
    ): void;
    registerControl(
      id: string,
      label: string,
      type: 'select',
      initialValue: string,
      onChange: (value: string) => void,
      options: { options: DevOverlaySelectOption[] },
    ): void;
  };
  update(): void;
};

type DevOverlaySectionLike = ReturnType<DevOverlayLike['registerSection']>;

class DevTestEntity extends BaseEntity {
  public readonly boundingBox: AABB = {
    min: new Vec2(-20, -14),
    max: new Vec2(20, 14),
  };

  public constructor() {
    super('dev-test-ship', 'ship', { x: 0, y: 0 });
    this.velocity = { x: 70, y: 25 };
  }

  public update(dt: number): void {
    this.position = {
      x: this.position.x + this.velocity.x * dt,
      y: this.position.y + this.velocity.y * dt,
    };

    this.rotation += 0.7 * dt;
  }
}

class DevSpriteTestEntity extends BaseEntity {
  public readonly boundingBox: AABB;

  public constructor(category: EntityCategory, width: number, height: number) {
    super(DEV_SPRITE_TEST_ENTITY_ID, category, {
      x: DEV_SPRITE_TEST_START_X,
      y: DEV_SPRITE_TEST_START_Y,
    });

    this.boundingBox = {
      min: new Vec2(-width / 2, -height / 2),
      max: new Vec2(width / 2, height / 2),
    };
  }
}

export class AppShell {
  public readonly canvas: HTMLCanvasElement;
  public readonly renderer: Renderer;
  public readonly gameLoop: GameLoop;
  public readonly audioManager: AudioManager;
  public readonly inputModeManager: InputModeManager;
  public readonly sceneRenderer: SceneRenderer;
  public readonly entityManager: EntityManager;
  public readonly visualProfileRegistry: VisualProfileRegistry;
  public readonly renderableFactory: RenderableFactory;
  private readonly systemSeedLoader: SystemSeedLoader;
  private readonly cache: OffscreenCache;
  private readonly assetLoader: AssetLoader;
  private readonly backgroundLayer: BackgroundLayer;
  private readonly parallaxLayer: ParallaxLayer;
  private readonly worldLayer: WorldLayer;
  private readonly renderablesByEntityId = new Map<string, Renderable>();
  private devOverlay?: DevOverlayLike;
  private activeSpriteTestProfileId: string | null = null;

  private readonly hudLayer: HTMLDivElement;
  private readonly screenLayer: HTMLDivElement;
  private readonly camera: Camera;
  private gameInput!: GameInput;
  private uiInput!: UIInput;
  private devOverlayUpdateElapsed = 0;
  private lastSystemLoadResult: SystemLoadResult | null = null;
  private currentSystemId = '-';
  private readonly systemCenter: Vector2 = { x: 0, y: 0 };
  private readonly virtualOrbitAroundAnchors = new Map<string, { clusterId: string; position: Vector2 }>();
  private devSpawnOrbitAroundRefresh: (() => void) | null = null;
  private devFlagsSection: DevOverlaySectionLike | null = null;
  private playerShipEntity: PlayerShipEntity | null = null;
  private devFlightMode = false;
  private pixelSnapStatic = true;
  private devSpawnCounter = 0;
  private smoothedFps = 0;
  private frameTimeMs = 0;
  private targetCameraZoom = 1;
  private inputControllersActive = false;
  private runtimeListenersBound = false;
  private devOverlayMounted = false;
  private devOverlayMountRequested = false;

  // UI – HUD i menu (etap 6)
  private readonly hudController: HudController;
  private readonly menuController: MenuController;
  private readonly menuRegistry: MenuRegistry;
  private readonly menuView: MenuView;

  private started = false;

  public constructor(root: HTMLElement) {
    root.replaceChildren();

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'game-layer';

    this.hudLayer = document.createElement('div');
    this.hudLayer.id = 'hud-layer';

    this.screenLayer = document.createElement('div');
    this.screenLayer.id = 'screen-layer';

    root.append(this.canvas, this.hudLayer, this.screenLayer);

    this.renderer = new Renderer(this.canvas);
    this.camera = new Camera(this.renderer.width, this.renderer.height);
    this.camera.setRenderScale(this.renderer.scale);
    this.targetCameraZoom = this.camera.zoom;
    this.audioManager = new AudioManager();
    this.inputModeManager = new InputModeManager();
    this.initializeInputControllers();

    // UI – inicjalizacja (etap 6); musi byc po InputModeManager
    this.menuRegistry = new MenuRegistry();
    this.menuView = new MenuView();
    this.menuController = new MenuController(
      this.menuRegistry,
      this.menuView,
      this.inputModeManager,
    );
    this.hudController = new HudController();

    this.cache = new OffscreenCache();
    this.entityManager = new EntityManager();
    this.visualProfileRegistry = new VisualProfileRegistry();
    this.assetLoader = new AssetLoader();
    this.renderableFactory = new RenderableFactory(this.cache, this.assetLoader);
    EntityRenderable.pixelSnapStatic = this.pixelSnapStatic;

    this.sceneRenderer = new SceneRenderer();

    this.backgroundLayer = new BackgroundLayer(this.cache, this.renderer.pixelWidth, this.renderer.pixelHeight, {
      starCount: 400,
      minBrightness: 0.3,
      maxBrightness: 1.0,
      minSize: 0.3,
      maxSize: 0.8,
      depthFactor: 0.015,
    });
    this.sceneRenderer.addLayer(this.backgroundLayer);

    this.parallaxLayer = new ParallaxLayer(
      this.cache,
      this.renderer.pixelWidth,
      this.renderer.pixelHeight,
      ACTIVE_PARALLAX_SUBLAYERS,
    );
    this.sceneRenderer.addLayer(this.parallaxLayer);

    this.worldLayer = new WorldLayer();
    this.sceneRenderer.addLayer(this.worldLayer);
    this.sceneRenderer.addLayer(new EffectsLayer());
    this.sceneRenderer.addLayer(new DebugLayer());

    this.systemSeedLoader = new SystemSeedLoader(
      this.entityManager,
      this.visualProfileRegistry,
      this.renderableFactory,
      this.worldLayer,
      this.renderablesByEntityId,
    );

    if (import.meta.env.DEV) {
      this.registerDevVisualProfiles();
      this.setDevTestEntityEnabled(this.readLocalStorageBoolean(DEV_TEST_ENTITY_STORAGE_KEY, false));
      this.exposeDevTools();

      void import('@dev/DevOverlayPanel').then(({ DevOverlayPanel }) => {
        const overlay = new DevOverlayPanel();
        this.devOverlay = overlay;
        if (this.devOverlayMountRequested && !this.devOverlayMounted) {
          overlay.mount(document.body);
          this.devOverlayMounted = true;
        }

        const entitiesSection = overlay.registerSection('entities', 'Entities');
        entitiesSection.registerMetric('total', 'total', () => this.entityManager.size);

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
          entitiesSection.registerMetric(category, category, () => this.entityManager.getByCategory(category).length);
        });

        const renderSection = overlay.registerSection('render', 'Render');
        renderSection.registerMetric('renderables', 'renderables', () => this.worldLayer.renderableCount);
        renderSection.registerMetric('visible', 'visible', () => this.worldLayer.lastVisibleCount);
        renderSection.registerMetric('culled', 'culled', () => this.worldLayer.lastCulledCount);

        const cameraSection = overlay.registerSection('camera', 'Camera');
        cameraSection.registerMetric('x', 'x', () => this.camera.position.x.toFixed(1));
        cameraSection.registerMetric('y', 'y', () => this.camera.position.y.toFixed(1));
        cameraSection.registerMetric('zoom', 'zoom', () => this.camera.zoom.toFixed(2));

        const cacheSection = overlay.registerSection('cache', 'Cache');
        cacheSection.registerMetric('used', 'used', () => {
          const bytes = this.cache.entityCacheBytes;
          const mb = bytes / (1024 * 1024);

          if (mb < 0.1) {
            return `${(bytes / 1024).toFixed(1)} KB`;
          }

          return `${mb.toFixed(1)} MB`;
        });
        cacheSection.registerMetric('limit', 'limit', () => `${(this.cache.entityCacheLimit / (1024 * 1024)).toFixed(0)} MB`);
        cacheSection.registerMetric('percent', 'percent', () => `${this.cache.entityCachePercent.toFixed(1)}%`);
        cacheSection.registerMetric('entries', 'entries', () => this.cache.size);

        const assetsSection = overlay.registerSection('assets', 'Assets');
        assetsSection.registerMetric('loaded', 'loaded', () => this.assetLoader.stats.loaded);
        assetsSection.registerMetric('total', 'total', () => this.assetLoader.stats.total);
        assetsSection.registerMetric('failed', 'failed', () => this.assetLoader.stats.failed);

        const systemSection = overlay.registerSection('system', 'System');
        systemSection.registerMetric('system', 'system', () => this.currentSystemId);
        systemSection.registerMetric('entities', 'entities', () => this.entityManager.size);
        systemSection.registerMetric('asteroids', 'asteroids', () => this.getAsteroidCount());
        systemSection.registerMetric('load-time', 'load time', () => {
          if (!this.lastSystemLoadResult) {
            return '-';
          }

          return `${this.lastSystemLoadResult.loadTimeMs} ms`;
        });
        systemSection.registerMetric('fps', 'fps', () =>
          this.smoothedFps > 0 ? this.smoothedFps.toFixed(1) : '-'
        );
        systemSection.registerMetric('frame-ms', 'frame ms', () =>
          this.frameTimeMs > 0 ? `${this.frameTimeMs.toFixed(2)} ms` : '-'
        );
        systemSection.registerMetric(
          'warnings',
          'warnings',
          () => this.lastSystemLoadResult?.warnings.length ?? 0,
        );
        systemSection.registerMetric('errors', 'errors', () => this.lastSystemLoadResult?.errors.length ?? 0);

        const spriteTestSection = overlay.registerSection('sprite-test', 'Sprite Test');
        spriteTestSection.registerMetric('active', 'active', () => this.activeSpriteTestProfileId ?? '-');
        spriteTestSection.registerMetric('available', 'available', () => this.getSpriteProfileIds().length);
        spriteTestSection.registerControl('spawn-next', 'Spawn next sprite', 'button', undefined, () => {
          this.spawnNextSpriteTestEntity();
        });
        spriteTestSection.registerControl('clear-sprite-test', 'Clear sprite test', 'button', undefined, () => {
          this.clearSpriteTestEntity();
        });

        const flightSection = overlay.registerSection('flight', 'Flight');
        flightSection.registerMetric('status', 'status', () =>
          this.playerShipEntity ? 'ready' : 'no player-ship'
        );
        flightSection.registerMetric('speed', 'speed', () => {
          if (!this.playerShipEntity) {
            return '-';
          }

          return `${this.playerShipEntity.speed.toFixed(1)} px/s`;
        });
        flightSection.registerMetric('heading', 'heading', () => {
          if (!this.playerShipEntity) {
            return '-';
          }

          const headingDeg = (this.playerShipEntity.heading * 180) / Math.PI;
          return `${headingDeg.toFixed(1)}°`;
        });
        flightSection.registerMetric('velocity', 'velocity', () => {
          if (!this.playerShipEntity) {
            return '-';
          }

          const velocity = this.playerShipEntity.currentVelocity;
          return `(${velocity.x.toFixed(1)}, ${velocity.y.toFixed(1)})`;
        });
        flightSection.registerMetric('acceleration', 'acceleration', () => {
          if (!this.playerShipEntity) {
            return '-';
          }

          const acceleration = this.playerShipEntity.acceleration;
          return `(${acceleration.x.toFixed(1)}, ${acceleration.y.toFixed(1)})`;
        });
        flightSection.registerMetric('flight-assist', 'flight assist', () => {
          if (!this.playerShipEntity) {
            return '-';
          }

          const isAutoStopHeld = this.gameInput.isKeyDown(FLIGHT_KEY_MAP['toggle-flight-assist']);
          return isAutoStopHeld ? 'AUTO-STOP (HOLD)' : 'OFF';
        });
        flightSection.registerMetric('position', 'position', () => {
          if (!this.playerShipEntity) {
            return '-';
          }

          return `(${this.playerShipEntity.position.x.toFixed(1)}, ${this.playerShipEntity.position.y.toFixed(1)})`;
        });

        const devFlagsSection = overlay.registerSection('dev-flags', 'Dev Flags');
        this.devFlagsSection = devFlagsSection;
        devFlagsSection.registerControl(
          'test-entity',
          'Test entity',
          'checkbox',
          this.readLocalStorageBoolean(DEV_TEST_ENTITY_STORAGE_KEY, false),
          (enabled: boolean) => {
            this.setDevTestEntityEnabled(enabled);
          },
        );
        devFlagsSection.registerControl(
          'flight-mode',
          'Flight mode',
          'checkbox',
          this.devFlightMode,
          (enabled: boolean) => {
            this.devFlightMode = enabled && this.playerShipEntity !== null;
          },
        );
        devFlagsSection.registerControl(
          'pixel-snap-static',
          'Pixel snap static',
          'checkbox',
          this.pixelSnapStatic,
          (enabled: boolean) => {
            this.pixelSnapStatic = enabled;
            EntityRenderable.pixelSnapStatic = enabled;
          },
        );

        this.registerDevSpawnSection(overlay);
      });
    }

    this.gameLoop = new GameLoop({
      tickRate: 60,
      onFixedUpdate: this.onFixedUpdate,
      onFrameUpdate: this.onFrameUpdate,
      onFrameRender: this.onFrameRender,
    });

    this.bindInputModeLogs();
    this.bindAudioInit();
    this.bindMenuKeys();
  }

  public async start(): Promise<void> {
    if (this.started) {
      return;
    }

    if (!this.inputControllersActive) {
      this.initializeInputControllers();
    }

    this.bindRuntimeListeners();
    if (import.meta.env.DEV) {
      this.devOverlayMountRequested = true;
      this.mountDevOverlayIfReady();
    }

    this.started = true;
    this.virtualOrbitAroundAnchors.clear();
    this.devSpawnOrbitAroundRefresh?.();

    const manifest = await this.assetLoader.loadManifest('/art/asset-manifest.json');
    if (manifest) {
      await this.assetLoader.preloadAll();
      registerManifestProfiles(manifest, this.visualProfileRegistry);
    }

    const loadResult = await this.systemSeedLoader.loadSystem(SYSTEM_SEED_URL);
    this.lastSystemLoadResult = loadResult;
    this.currentSystemId = loadResult.systemId;

    this.virtualOrbitAroundAnchors.clear();
    loadResult.asteroidClusterAnchors.forEach((anchor) => {
      this.virtualOrbitAroundAnchors.set(anchor.anchorId, {
        clusterId: anchor.clusterId,
        position: {
          x: anchor.position.x,
          y: anchor.position.y,
        },
      });
    });
    this.devSpawnOrbitAroundRefresh?.();

    this.initializePlayerShipEntity();
    this.devFlagsSection?.registerControl(
      'flight-mode',
      'Flight mode',
      'checkbox',
      this.devFlightMode,
      (enabled: boolean) => {
        this.devFlightMode = enabled && this.playerShipEntity !== null;
      },
    );

    // Zainicjuj stacje i wraki jako dockable
    this.markDockableEntities();

    // Zamontuj HUD i menu po zaladowaniu systemu
    this.hudController.mount(this.hudLayer);
    this.menuView.mount(this.screenLayer, {
      onSelect: () => { /* obsluzone wewnatrz MenuController */ },
      onBack: () => { /* obsluzone wewnatrz MenuController */ },
      onClose: () => { this.menuController.close(); },
    });

    this.canvas.focus();
    this.gameLoop.start();
  }

  public stop(): void {
    if (!this.started) {
      return;
    }

    this.started = false;
    this.gameLoop.stop();
    this.gameInput.destroy();
    this.uiInput.destroy();
    this.inputControllersActive = false;
    this.unbindRuntimeListeners();

    this.hudController.unmount();
    this.menuView.unmount();

    if (import.meta.env.DEV) {
      this.devOverlayMountRequested = false;
      this.unmountDevOverlayIfMounted();
    }
  }

  private initializeInputControllers(): void {
    this.gameInput = new GameInput(this.canvas, this.inputModeManager);
    this.uiInput = new UIInput(this.inputModeManager);
    this.gameInput.setCamera(this.camera);
    this.bindInputActions();
    this.inputControllersActive = true;
  }

  private bindRuntimeListeners(): void {
    if (this.runtimeListenersBound) {
      return;
    }

    if (import.meta.env.DEV) {
      window.addEventListener('keydown', this.handleDevOverlayToggleKeydown);
    }

    window.addEventListener('resize', this.handleResize);
    this.canvas.addEventListener('wheel', this.handleCameraZoomWheel, { passive: false });
    this.runtimeListenersBound = true;
  }

  private unbindRuntimeListeners(): void {
    if (!this.runtimeListenersBound) {
      return;
    }

    if (import.meta.env.DEV) {
      window.removeEventListener('keydown', this.handleDevOverlayToggleKeydown);
    }

    window.removeEventListener('resize', this.handleResize);
    this.canvas.removeEventListener('wheel', this.handleCameraZoomWheel);
    this.runtimeListenersBound = false;
  }

  private mountDevOverlayIfReady(): void {
    if (!this.devOverlay || this.devOverlayMounted) {
      return;
    }

    this.devOverlay.mount(document.body);
    this.devOverlayMounted = true;
  }

  private unmountDevOverlayIfMounted(): void {
    if (!this.devOverlay || !this.devOverlayMounted) {
      return;
    }

    this.devOverlay.unmount();
    this.devOverlayMounted = false;
  }

  private readonly onFixedUpdate = (dt: number): void => {
    this.gameInput.update();

    this.entityManager.getAll().forEach((entity) => {
      if (this.hasSavePreviousState(entity)) {
        entity.savePreviousState();
      }
    });

    this.entityManager.getAll().forEach((entity) => {
      if (this.hasUpdate(entity)) {
        entity.update(dt);
      }
    });

    this.entityManager.sweepDead();
    this.pruneRenderables();

    if (this.playerShipEntity && !this.entityManager.has(this.playerShipEntity.id)) {
      this.playerShipEntity = null;
      this.devFlightMode = false;
      this.devFlagsSection?.registerControl(
        'flight-mode',
        'Flight mode',
        'checkbox',
        this.devFlightMode,
        (enabled: boolean) => {
          this.devFlightMode = enabled && this.playerShipEntity !== null;
        },
      );
    }

    if (this.inputModeManager.mode !== 'game') {
      return;
    }

    if (this.playerShipEntity) {
      this.playerShipEntity.updateFlight(dt, {
        rotateLeft: this.gameInput.isKeyDown(FLIGHT_KEY_MAP['rotate-left']),
        rotateRight: this.gameInput.isKeyDown(FLIGHT_KEY_MAP['rotate-right']),
        rearThruster: this.gameInput.isKeyDown(FLIGHT_KEY_MAP['rear-thruster']),
        frontThruster: this.gameInput.isKeyDown(FLIGHT_KEY_MAP['front-thruster']),
        autoStop: this.gameInput.isKeyDown(FLIGHT_KEY_MAP['toggle-flight-assist']),
      });
    }

    if (this.devFlightMode && this.playerShipEntity) {
      return;
    }

    const moveX =
      (this.gameInput.isKeyDown('arrowright') ? 1 : 0) -
      (this.gameInput.isKeyDown('arrowleft') ? 1 : 0);
    const moveY =
      (this.gameInput.isKeyDown('arrowdown') ? 1 : 0) -
      (this.gameInput.isKeyDown('arrowup') ? 1 : 0);

    if (moveX !== 0 || moveY !== 0) {
      this.camera.position = {
        x: this.camera.position.x + moveX * CAMERA_SPEED * dt,
        y: this.camera.position.y + moveY * CAMERA_SPEED * dt,
      };
    }
  };

  private readonly onFrameUpdate = (dt: number, alpha: number): void => {
    this.frameTimeMs = dt * 1000;
    if (dt > 0) {
      const instantFps = 1 / dt;
      this.smoothedFps =
        this.smoothedFps === 0
          ? instantFps
          : this.smoothedFps * 0.9 + instantFps * 0.1;
    }

            this.updateCameraZoom(dt);

    if (
      this.inputModeManager.mode === 'game' &&
      this.devFlightMode &&
      this.playerShipEntity
    ) {
      const interpolatedPlayerPosition = {
        x:
          this.playerShipEntity.previousPosition.x +
          (this.playerShipEntity.position.x - this.playerShipEntity.previousPosition.x) * alpha,
        y:
          this.playerShipEntity.previousPosition.y +
          (this.playerShipEntity.position.y - this.playerShipEntity.previousPosition.y) * alpha,
      };
      this.camera.follow(interpolatedPlayerPosition);
    }

    let renderOrderDirty = false;

    this.entityManager.getAll().forEach((entity) => {
      const renderable = this.renderablesByEntityId.get(entity.id);
      if (!renderable) {
        return;
      }

      renderable.position = { ...entity.position };
      renderable.previousPosition = { ...entity.previousPosition };
      renderable.rotation = entity.rotation;
      renderable.previousRotation = entity.previousRotation;

      const maybeHeightAwareEntity = entity as GameEntity & { computedHeight?: number };
      if (typeof maybeHeightAwareEntity.computedHeight === 'number') {
        if (renderable.computedHeight !== maybeHeightAwareEntity.computedHeight) {
          renderable.computedHeight = maybeHeightAwareEntity.computedHeight;
          renderOrderDirty = true;
        }
      }
    });

    if (renderOrderDirty) {
      this.worldLayer.markRenderOrderDirty();
    }

    this.sceneRenderer.update(dt, this.camera);

    // Aktualizuj HUD kazdy frame (etap 6)
    this.updateHud(dt);

    if (!this.devOverlay) {
      return;
    }

    this.devOverlayUpdateElapsed += dt;
    if (this.devOverlayUpdateElapsed < DEV_OVERLAY_UPDATE_INTERVAL) {
      return;
    }

    this.devOverlayUpdateElapsed = 0;
    this.devOverlay.update();
  };

  /** Buduje HudContext z biezacego stanu gry i przekazuje do HudController. */
  private updateHud(dt: number): void {
    if (!this.playerShipEntity) {
      this.hudController.update(null);
      return;
    }

    const player = this.playerShipEntity;

    // Kontakty radaru z EntityManager
    const radarContacts: RadarContact[] = this.entityManager.getAll()
      .filter((e) => e.id !== player.id)
      .map((e): RadarContact => {
        const we = e instanceof WorldEntity ? e : null;
        const type = we
          ? ((
              we.seedType === 'station' || we.seedType === 'station-wreck' ? 'station'
            : we.seedType === 'ship-wreck' ? 'wreck'
            : we.seedType === 'npc-ship' ? 'ship'
            : we.seedType === 'container' ? 'container'
            : we.seedType === 'star' ? 'star'
            : we.seedType === 'planet' || we.seedType === 'moon' ? 'planet'
            : 'other'
          ) as RadarContact['type'])
          : 'other';

        return {
          id: e.id,
          type,
          relation: 'neutral' as const,
          worldX: e.position.x,
          worldY: e.position.y,
          active: true,
        };
      });

    const radarRange = Math.max(
      RADAR_DEFAULT_CONFIG.minRangeUnits,
      RADAR_DEFAULT_CONFIG.baseRangeUnits * RADAR_DEFAULT_CONFIG.rangeModifier,
    );

    const context: HudContext = {
      timestampMs: performance.now(),
      playerShipId: player.id,
      hudLayoutId: 'default',
      reactor: REACTOR_TEST_PAYLOAD,
      radar: {
        rangeUnits: radarRange,
        baseRangeUnits: RADAR_DEFAULT_CONFIG.baseRangeUnits,
        rangeModifier: RADAR_DEFAULT_CONFIG.rangeModifier,
        centerWorld: { x: player.position.x, y: player.position.y },
        contacts: radarContacts,
        noiseSeed: 42,
      },
      shipStatus: {
        ...SHIP_STATUS_TEST_PAYLOAD,
        velocity: { currentPxPerSec: player.speed },
      },
      target: TARGET_EMPTY_PAYLOAD,
    };

    this.hudController.update(context);
  }

  private readonly onFrameRender = (alpha: number): void => {
    this.sceneRenderer.render(this.renderer.ctx, this.camera, alpha);
  };

  private readonly handleResize = (): void => {
    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.camera.setViewport(this.renderer.width, this.renderer.height);
    this.camera.setRenderScale(this.renderer.scale);
    this.backgroundLayer.regenerate(this.renderer.pixelWidth, this.renderer.pixelHeight);
    this.parallaxLayer.regenerate(this.renderer.pixelWidth, this.renderer.pixelHeight);
  };

  private readonly handleCameraZoomWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const step = event.deltaY > 0 ? -CAMERA_ZOOM_STEP : CAMERA_ZOOM_STEP;
    this.targetCameraZoom = this.clampCameraZoom(this.targetCameraZoom + step);
  };

  private updateCameraZoom(dt: number): void {
    const lerpFactor = Math.min(1, dt * CAMERA_ZOOM_LERP_RATE);
    this.camera.zoom = this.clampCameraZoom(
      this.camera.zoom + (this.targetCameraZoom - this.camera.zoom) * lerpFactor,
    );
  }

  private clampCameraZoom(value: number): number {
    return Math.max(CAMERA_ZOOM_MIN, Math.min(CAMERA_ZOOM_MAX, value));
  }

  private bindInputModeLogs(): void {
    this.inputModeManager.onModeChanged((mode) => {
      console.log(`[InputMode] -> ${mode}`);
    });
  }

  private bindInputActions(): void {
    this.gameInput.onAction('toggle-ui', () => {
      this.inputModeManager.setMode('ui');
    });

    this.uiInput.onCancel(() => {
      this.inputModeManager.setMode('game');
    });
  }

  /**
   * Obsuga klawiszy menu (etap 6):
   * Esc  – menu gry (gdy nie ma otwartego menu obiektowego)
   * B    – menu statku gracza
   * E    – dokowanie do najblizszego obiektu dokowalnego
   */
  private bindMenuKeys(): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (this.menuController.isMenuOpen) {
        // Nawigacja jest obsługiwana przez MenuController
        return;
      }

      if (this.inputModeManager.mode !== 'game') {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        this.menuController.openGameMenu();
        return;
      }

      if (event.key === 'b' || event.key === 'B') {
        event.preventDefault();
        const label = this.playerShipEntity?.id ?? 'Player Ship';
        this.menuController.openPlayerShipMenu(label);
        return;
      }

      if (event.key === 'e' || event.key === 'E') {
        event.preventDefault();
        this.tryDockNearestEntity();
        return;
      }
    });
  }

  /**
   * Ustawia dockable = true dla stacji i wraków zaladowanych z seeda.
   */
  private markDockableEntities(): void {
    this.entityManager.getAll().forEach((entity) => {
      if (!(entity instanceof WorldEntity)) {
        return;
      }

      const dockable =
        entity.seedType === 'station' ||
        entity.seedType === 'station-wreck' ||
        entity.seedType === 'ship-wreck' ||
        entity.seedType === 'container';

      if (dockable) {
        entity.dockable = true;
      }
    });
  }

  /**
   * Szuka najbliższego obiektu dockable w zasięgu 20 px renderowanych granic
   * i próbuje dokować.
   */
  private tryDockNearestEntity(): void {
    if (!this.playerShipEntity) {
      return;
    }

    const player = this.playerShipEntity;
    const playerBounds = {
      minX: player.position.x + player.boundingBox.min.x,
      minY: player.position.y + player.boundingBox.min.y,
      maxX: player.position.x + player.boundingBox.max.x,
      maxY: player.position.y + player.boundingBox.max.y,
    };

    // Szukamy dockable w zasiegu
    const candidates = this.entityManager.getAll().filter(
      (e): e is WorldEntity => e instanceof WorldEntity && e.dockable,
    );

    for (const candidate of candidates) {
      const targetBounds = {
        minX: candidate.position.x + candidate.boundingBox.min.x,
        minY: candidate.position.y + candidate.boundingBox.min.y,
        maxX: candidate.position.x + candidate.boundingBox.max.x,
        maxY: candidate.position.y + candidate.boundingBox.max.y,
      };

      const objectType: MenuObjectType = (
        candidate.seedType === 'station' || candidate.seedType === 'station-wreck' ? 'station'
        : candidate.seedType === 'ship-wreck' ? 'wreck'
        : candidate.seedType === 'container' ? 'container'
        : 'station'
      );

      const objectState: ObjectState = (
        candidate.seedType === 'station-wreck' || candidate.seedType === 'ship-wreck' ? 'destroyed'
        : 'active'
      );

      const docked = this.menuController.tryDock(
        {
          id: candidate.id,
          objectType,
          objectState,
          sceneLabel: candidate.id,
          dockable: true,
          screenBounds: targetBounds,
        },
        playerBounds,
      );

      if (docked) {
        break;
      }
    }
  }

  private bindAudioInit(): void {
    window.addEventListener(
      'pointerdown',
      () => {
        void this.audioManager.init().then(() => {
          console.log(`[Audio] context state=${this.getAudioState()}`);
        });
      },
      { once: true },
    );
  }

  private getAudioState(): string {
    return 'running';
  }

  private registerDevVisualProfiles(): void {
    const devShipProfile: VisualProfile = {
      profileId: 'dev-ship-procedural',
      category: 'ship',
      size: { width: 48, height: 30 },
      cullRadius: 32,
      source: {
        type: 'procedural',
        drawFn: (ctx, width, height) => {
          ctx.fillStyle = '#2ec4b6';
          ctx.beginPath();
          ctx.moveTo(width * 0.5, 0);
          ctx.lineTo(-width * 0.5, height * 0.4);
          ctx.lineTo(-width * 0.22, 0);
          ctx.lineTo(-width * 0.5, -height * 0.4);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        },
      },
    };

    this.visualProfileRegistry.register(devShipProfile);
  }

  private registerDevTestEntity(): void {
    if (this.entityManager.has(DEV_TEST_ENTITY_ID)) {
      return;
    }

    const profile = this.visualProfileRegistry.get('dev-ship-procedural');
    if (!profile) {
      throw new Error('Missing dev profile: dev-ship-procedural');
    }

    const entity = new DevTestEntity();
    this.entityManager.add(entity);

    const renderable = this.renderableFactory.create(entity, profile);
    this.renderablesByEntityId.set(entity.id, renderable);
    this.worldLayer.addRenderable(renderable);
  }

  private unregisterDevTestEntity(): void {
    if (!this.entityManager.has(DEV_TEST_ENTITY_ID)) {
      return;
    }

    this.entityManager.remove(DEV_TEST_ENTITY_ID);
    this.renderablesByEntityId.delete(DEV_TEST_ENTITY_ID);
    this.worldLayer.removeRenderable(DEV_TEST_ENTITY_ID);
  }

  private setDevTestEntityEnabled(enabled: boolean): void {
    localStorage.setItem(DEV_TEST_ENTITY_STORAGE_KEY, String(enabled));
    if (enabled) {
      this.registerDevTestEntity();
      return;
    }

    this.unregisterDevTestEntity();
  }

  private getSpriteProfileIds(): string[] {
    const manifest = this.assetLoader.getManifest();
    if (!manifest) {
      return [];
    }

    return manifest.assets
      .map((entry) => entry.assetId)
      .filter((profileId) => this.visualProfileRegistry.get(profileId)?.source.type === 'sprite');
  }

  private spawnNextSpriteTestEntity(): void {
    const spriteProfileIds = this.getSpriteProfileIds();
    if (spriteProfileIds.length === 0) {
      console.warn('[AppShell] No sprite profiles available for sprite test.');
      return;
    }

    const currentIndex = this.activeSpriteTestProfileId
      ? spriteProfileIds.indexOf(this.activeSpriteTestProfileId)
      : -1;

    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % spriteProfileIds.length;
    const nextProfileId = spriteProfileIds[nextIndex];
    this.spawnSpriteTestEntity(nextProfileId);
  }

  private spawnSpriteTestEntity(profileId: string): void {
    const profile = this.visualProfileRegistry.get(profileId);
    if (!profile || profile.source.type !== 'sprite') {
      console.warn(`[AppShell] Cannot spawn sprite test entity for profile: ${profileId}.`);
      return;
    }

    this.clearSpriteTestEntity();

    const entity = new DevSpriteTestEntity(profile.category, profile.size.width, profile.size.height);
    this.entityManager.add(entity);

    const renderable = this.renderableFactory.create(entity, profile);
    this.renderablesByEntityId.set(entity.id, renderable);
    this.worldLayer.addRenderable(renderable);
    this.activeSpriteTestProfileId = profile.profileId;
  }

  private clearSpriteTestEntity(): void {
    if (this.entityManager.has(DEV_SPRITE_TEST_ENTITY_ID)) {
      this.entityManager.remove(DEV_SPRITE_TEST_ENTITY_ID);
    }

    this.renderablesByEntityId.delete(DEV_SPRITE_TEST_ENTITY_ID);
    this.worldLayer.removeRenderable(DEV_SPRITE_TEST_ENTITY_ID);
    this.activeSpriteTestProfileId = null;
  }

  private registerDevSpawnSection(overlay: DevOverlayLike): void {
    const section = overlay.registerSection('dev-spawn', 'Dev Spawn');
    const seedTypes: SeedObjectType[] = [
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
    ];

    let selectedType: SeedObjectType = 'npc-ship';
    let selectedProfileId = '';
    let orbitRadius = DEV_SPAWN_DEFAULT_ORBIT_RADIUS;
    let orbitPhase = DEV_SPAWN_DEFAULT_ORBIT_PHASE;
    let orbitAround: string | null = null;
    let height = BASE_HEIGHT_BY_SEED_TYPE[selectedType];

    const refreshHeightControl = (): void => {
      section.registerControl(
        'height',
        'height',
        'number',
        height,
        (value: number) => {
          const normalized = Math.max(1, Math.round(value));
          if (selectedType === 'player-ship' && normalized < 11) {
            height = 11;
            refreshHeightControl();
            return;
          }

          height = normalized;
        },
        { min: 1, step: 1 },
      );
    };

    const refreshProfileControl = (): void => {
      const options = this.getProfileOptionsForSeedType(selectedType);
      if (options.length > 0 && !options.some((option) => option.value === selectedProfileId)) {
        selectedProfileId = options[0].value;
      }

      if (options.length === 0) {
        selectedProfileId = '';
      }

      section.registerControl(
        'profile-id',
        'profileId',
        'select',
        selectedProfileId,
        (value: string) => {
          selectedProfileId = value;
        },
        {
          options:
            options.length > 0
              ? options
              : [
                  {
                    value: '',
                    label: '(no matching profiles)',
                  },
                ],
        },
      );
    };

    const refreshOrbitAroundControl = (): void => {
      const options = [
        { value: '', label: 'centrum' },
        ...this.getOrbitAroundOptions(),
      ];

      if (!options.some((option) => option.value === (orbitAround ?? ''))) {
        orbitAround = null;
      }

      section.registerControl(
        'orbit-around',
        'orbitAround',
        'select',
        orbitAround ?? '',
        (value: string) => {
          orbitAround = value === '' ? null : value;
        },
        { options },
      );
    };

    this.devSpawnOrbitAroundRefresh = refreshOrbitAroundControl;

    section.registerControl(
      'type',
      'type',
      'select',
      selectedType,
      (value: string) => {
        if (!this.isSeedObjectType(value)) {
          return;
        }

        selectedType = value;
        height = BASE_HEIGHT_BY_SEED_TYPE[selectedType];

        refreshHeightControl();
        refreshProfileControl();
      },
      {
        options: seedTypes.map((type) => ({ value: type, label: type })),
      },
    );

    section.registerControl(
      'orbit-radius',
      'orbitRadius',
      'number',
      orbitRadius,
      (value: number) => {
        orbitRadius = Math.max(0, Math.round(value));
      },
      { min: 0, step: 1 },
    );

    section.registerControl(
      'orbit-phase',
      'orbitPhase',
      'number',
      orbitPhase,
      (value: number) => {
        orbitPhase = value;
      },
      { step: 1 },
    );

    refreshHeightControl();
    refreshProfileControl();
    refreshOrbitAroundControl();

    section.registerControl('spawn', 'Spawn', 'button', undefined, () => {
      const spawned = this.spawnDevEntityFromForm({
        type: selectedType,
        profileId: selectedProfileId,
        orbitRadius,
        orbitPhase,
        orbitAround,
        height,
      });

      if (spawned) {
        refreshOrbitAroundControl();
      }
    });
  }

  private spawnDevEntityFromForm(config: {
    type: SeedObjectType;
    profileId: string;
    orbitRadius: number;
    orbitPhase: number;
    orbitAround: string | null;
    height: number;
  }): boolean {
    if (!config.profileId) {
      console.warn('[AppShell] Dev Spawn: profileId is required.');
      return false;
    }

    const profile = this.visualProfileRegistry.get(config.profileId);
    if (!profile) {
      console.warn(`[AppShell] Dev Spawn: unknown profileId "${config.profileId}".`);
      return false;
    }

    let parentPosition = this.systemCenter;
    if (config.orbitAround) {
      const virtualAnchor = this.virtualOrbitAroundAnchors.get(config.orbitAround);
      if (virtualAnchor) {
        parentPosition = virtualAnchor.position;
      } else {
        const parent = this.entityManager.get(config.orbitAround);
        if (!parent) {
          console.warn(`[AppShell] Dev Spawn: parent "${config.orbitAround}" not found.`);
          return false;
        }

        parentPosition = parent.position;
      }
    }

    const normalizedPhase = ((config.orbitPhase % 360) + 360) % 360;
    const position = computeOrbitPosition(
      parentPosition,
      Math.max(0, config.orbitRadius),
      normalizedPhase,
    );

    const baseHeight = Math.max(1, Math.round(config.height));
    const normalizedHeight =
      config.type === 'player-ship' && baseHeight < 11 ? 11 : baseHeight;

    this.devSpawnCounter += 1;
    const id = `dev-spawn-${this.devSpawnCounter}`;
    const computedHeight = normalizedHeight + this.devSpawnCounter / 10000;
    const isStatic = config.type !== 'npc-ship' && config.type !== 'player-ship';

    const entity = new WorldEntity({
      id,
      category: SEED_TYPE_TO_CATEGORY[config.type],
      seedType: config.type,
      position,
      width: profile.size.width,
      height: profile.size.height,
      computedHeight,
      isStatic,
      profileId: config.profileId,
    });

    this.entityManager.add(entity);

    const renderable = this.renderableFactory.create(entity, profile);
    renderable.computedHeight = entity.computedHeight;
    renderable.visible = true;

    this.renderablesByEntityId.set(entity.id, renderable);
    this.worldLayer.addRenderable(renderable);
    return true;
  }

  private getProfileOptionsForSeedType(type: SeedObjectType): DevOverlaySelectOption[] {
    const category = SEED_TYPE_TO_CATEGORY[type];
    return this.visualProfileRegistry
      .getAll()
      .filter((profile) => profile.category === category)
      .map((profile) => ({ value: profile.profileId, label: profile.profileId }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  private getOrbitAroundOptions(): DevOverlaySelectOption[] {
    const entityOptions = this.entityManager
      .getAll()
      .filter((entity) => !(entity instanceof WorldEntity && entity.seedType === 'asteroid'))
      .map((entity) => ({ value: entity.id, label: entity.id }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const clusterOptions = Array.from(this.virtualOrbitAroundAnchors.entries())
      .map(([anchorId, anchor]) => ({
        value: anchorId,
        label: `asteroid-cluster:${anchor.clusterId}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [...entityOptions, ...clusterOptions];
  }

  private getAsteroidCount(): number {
    return this.entityManager
      .getAll()
      .filter((entity) => entity instanceof WorldEntity && entity.seedType === 'asteroid').length;
  }

  private isSeedObjectType(value: string): value is SeedObjectType {
    return (
      value === 'star' ||
      value === 'planet' ||
      value === 'moon' ||
      value === 'gate' ||
      value === 'station-wreck' ||
      value === 'station' ||
      value === 'container' ||
      value === 'ship-wreck' ||
      value === 'npc-ship' ||
      value === 'player-ship'
    );
  }

  private initializePlayerShipEntity(): void {
    const playerEntity = this.entityManager.getAll().find(
      (entity): entity is WorldEntity => entity instanceof WorldEntity && entity.seedType === 'player-ship',
    );

    if (!playerEntity) {
      this.playerShipEntity = null;
      this.devFlightMode = false;
      console.warn('[AppShell] Missing player-ship entity. Flight mode disabled.');
      return;
    }

    const width = playerEntity.boundingBox.max.x - playerEntity.boundingBox.min.x;
    const height = playerEntity.boundingBox.max.y - playerEntity.boundingBox.min.y;

    const playerShipEntity = new PlayerShipEntity({
      id: playerEntity.id,
      category: playerEntity.category,
      seedType: playerEntity.seedType,
      position: { ...playerEntity.position },
      width,
      height,
      computedHeight: playerEntity.computedHeight,
      isStatic: playerEntity.isStatic,
      profileId: playerEntity.profileId,
      flightConfig: DEFAULT_FLIGHT_CONFIG,
    });

    playerShipEntity.velocity = { ...playerEntity.velocity };
    playerShipEntity.rotation = playerEntity.rotation;
    playerShipEntity.previousPosition = { ...playerEntity.previousPosition };
    playerShipEntity.previousRotation = playerEntity.previousRotation;

    this.entityManager.remove(playerEntity.id);
    this.entityManager.add(playerShipEntity);

    this.playerShipEntity = playerShipEntity;
    this.devFlightMode = true;
  }


  private pruneRenderables(): void {
    Array.from(this.renderablesByEntityId.keys()).forEach((entityId) => {
      if (this.entityManager.has(entityId)) {
        return;
      }

      this.renderablesByEntityId.delete(entityId);
      this.worldLayer.removeRenderable(entityId);
    });
  }

  private exposeDevTools(): void {
    const devTarget = globalThis as typeof globalThis & {
      __dev?: {
        entityManager: EntityManager;
        worldLayer: WorldLayer;
        cache: OffscreenCache;
      };
    };

    devTarget.__dev = {
      entityManager: this.entityManager,
      worldLayer: this.worldLayer,
      cache: this.cache,
    };
  }

  private readonly handleDevOverlayToggleKeydown = (event: KeyboardEvent): void => {
    if (!this.devOverlay || event.key !== '6') {
      return;
    }

    event.preventDefault();
    this.devOverlay.toggle();
  };

  private readLocalStorageBoolean(key: string, fallbackValue: boolean): boolean {
    const value = localStorage.getItem(key);
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }

    return fallbackValue;
  }

  private hasSavePreviousState(entity: GameEntity): entity is GameEntity & {
    savePreviousState: () => void;
  } {
    return 'savePreviousState' in entity && typeof entity.savePreviousState === 'function';
  }

  private hasUpdate(entity: GameEntity): entity is GameEntity & { update: (dt: number) => void } {
    return 'update' in entity && typeof entity.update === 'function';
  }
}
