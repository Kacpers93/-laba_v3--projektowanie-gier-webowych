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
import { RenderableFactory } from '@presentation/renderables';
import { BackgroundLayer } from '@presentation/scene/BackgroundLayer';
import { DebugLayer } from '@presentation/scene/DebugLayer';
import { EffectsLayer } from '@presentation/scene/EffectsLayer';
import { ACTIVE_PARALLAX_SUBLAYERS } from '@presentation/scene/parallax-presets';
import { ParallaxLayer } from '@presentation/scene/ParallaxLayer';
import { SceneRenderer } from '@presentation/scene/SceneRenderer';
import { WorldLayer } from '@presentation/scene/WorldLayer';
import type { Renderable } from '@/types/engine';
import { SystemSeedLoader, SEED_OBJECT_BASE_HEIGHT, SEED_TYPE_TO_CATEGORY, computeOrbitPosition } from '@world/seed';
import type { SystemLoadResult, SeedObjectType } from '@world/seed';
import { WorldEntity } from '@world/entities';

const CAMERA_SPEED = 220;
const DEV_OVERLAY_UPDATE_INTERVAL = 0.25;
const DEV_TEST_ENTITY_STORAGE_KEY = 'dev-test-entity';
const DEV_TEST_ENTITY_ID = 'dev-test-ship';
const DEV_SPRITE_TEST_ENTITY_ID = 'dev-sprite-test';
const DEV_SPRITE_TEST_START_X = 140;
const DEV_SPRITE_TEST_START_Y = -90;

type DevOverlayLike = {
  mount(parent: HTMLElement): void;
  unmount(): void;
  toggle(): void;
  removeSection(id: string): void;
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
      type: 'select',
      initialValue: string,
      onChange: (value: string) => void,
      options: Array<{ label: string; value: string }>,
    ): void;
    registerControl(
      id: string,
      label: string,
      type: 'number',
      initialValue: number,
      onChange: (value: number) => void,
      bounds?: { min?: number; max?: number; step?: number },
    ): void;
  };
  update(): void;
};

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
  private currentSystemId = '';
  private lastLoadResult: SystemLoadResult | null = null;
  private devSpawnType: SeedObjectType = 'station';
  private devSpawnProfileId = '';
  private devSpawnOrbitRadius = 300;
  private devSpawnOrbitPhase = 0;
  private devSpawnOrbitAroundId = 'center';
  private devSpawnHeight = SEED_OBJECT_BASE_HEIGHT.station;
  private devSpawnSequence = 0;

  private readonly hudLayer: HTMLDivElement;
  private readonly screenLayer: HTMLDivElement;
  private readonly camera: Camera;
  private readonly gameInput: GameInput;
  private readonly uiInput: UIInput;
  private devOverlayUpdateElapsed = 0;

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
    this.audioManager = new AudioManager();
    this.inputModeManager = new InputModeManager();
    this.gameInput = new GameInput(this.canvas, this.inputModeManager);
    this.uiInput = new UIInput(this.inputModeManager);

    this.gameInput.setCamera(this.camera);

    this.cache = new OffscreenCache();
    this.entityManager = new EntityManager();
    this.visualProfileRegistry = new VisualProfileRegistry();
    this.assetLoader = new AssetLoader();
    this.renderableFactory = new RenderableFactory(this.cache, this.assetLoader);
    this.registerSystemFallbackProfiles();

    this.sceneRenderer = new SceneRenderer();

    this.backgroundLayer = new BackgroundLayer(this.cache, this.renderer.width, this.renderer.height, {
      starCount: 400,
      minBrightness: 0.3,
      maxBrightness: 1.0,
      minSize: 0.5,
      maxSize: 2.0,
    });
    this.sceneRenderer.addLayer(this.backgroundLayer);

    this.parallaxLayer = new ParallaxLayer(
      this.cache,
      this.renderer.width,
      this.renderer.height,
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
        overlay.mount(document.body);
        this.registerDevOverlaySections(overlay);
      });

      window.addEventListener('keydown', this.handleDevOverlayToggleKeydown);
    }

    this.gameLoop = new GameLoop({
      tickRate: 30,
      onFixedUpdate: this.onFixedUpdate,
      onFrameUpdate: this.onFrameUpdate,
      onFrameRender: this.onFrameRender,
    });

    this.bindInputModeLogs();
    this.bindInputActions();
    this.bindAudioInit();

    window.addEventListener('resize', this.handleResize);
  }

  public async start(): Promise<void> {
    if (this.started) {
      return;
    }

    this.started = true;

    const manifest = await this.assetLoader.loadManifest('/art/asset-manifest.json');
    if (manifest) {
      await this.assetLoader.preloadAll();
      registerManifestProfiles(manifest, this.visualProfileRegistry);
    }

    this.lastLoadResult = await this.systemSeedLoader.loadSystem('/world/systems/sol-001.json');
    this.currentSystemId = this.lastLoadResult.systemId;
    this.refreshDevSpawnSection();

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
    if (import.meta.env.DEV) {
      window.removeEventListener('keydown', this.handleDevOverlayToggleKeydown);
      this.devOverlay?.unmount();
    }
    window.removeEventListener('resize', this.handleResize);
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

    if (this.inputModeManager.mode !== 'game') {
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
      console.log(
        `[Camera] position=(${this.camera.position.x.toFixed(2)}, ${this.camera.position.y.toFixed(2)}) zoom=${this.camera.zoom.toFixed(2)}`,
      );
    }
  };

  private readonly onFrameUpdate = (dt: number, _alpha: number): void => {
    this.entityManager.getAll().forEach((entity) => {
      const renderable = this.renderablesByEntityId.get(entity.id);
      if (!renderable) {
        return;
      }

      renderable.position = { ...entity.position };
      renderable.previousPosition = { ...entity.previousPosition };
      renderable.rotation = entity.rotation;
      renderable.previousRotation = entity.previousRotation;
    });

    this.sceneRenderer.update(dt, this.camera);

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

  private readonly onFrameRender = (alpha: number): void => {
    this.sceneRenderer.render(this.renderer.ctx, this.camera, alpha);
  };

  private readonly handleResize = (): void => {
    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.camera.setViewport(this.renderer.width, this.renderer.height);
    this.backgroundLayer.regenerate(this.renderer.width, this.renderer.height);
    this.parallaxLayer.regenerate(this.renderer.width, this.renderer.height);
  };

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

  private registerSystemFallbackProfiles(): void {
    const register = (profile: VisualProfile): void => {
      if (this.visualProfileRegistry.has(profile.profileId)) {
        return;
      }

      this.visualProfileRegistry.register(profile);
    };

    register({
      profileId: 'star-yellow-large',
      category: 'celestial',
      size: { width: 220, height: 220 },
      cullRadius: 160,
      source: {
        type: 'procedural',
        drawFn: (ctx, width, height) => {
          ctx.fillStyle = '#ffd166';
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(width, height) * 0.45, 0, Math.PI * 2);
          ctx.fill();
        },
      },
    });

    register({
      profileId: 'moon-small',
      category: 'celestial',
      size: { width: 72, height: 72 },
      cullRadius: 52,
      source: {
        type: 'procedural',
        drawFn: (ctx, width, height) => {
          ctx.fillStyle = '#c5d1de';
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(width, height) * 0.42, 0, Math.PI * 2);
          ctx.fill();
        },
      },
    });

    register({
      profileId: 'cargo-container',
      category: 'environment',
      size: { width: 52, height: 36 },
      cullRadius: 32,
      source: {
        type: 'procedural',
        drawFn: (ctx, width, height) => {
          ctx.fillStyle = '#f4a261';
          ctx.fillRect(-width / 2, -height / 2, width, height);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.strokeRect(-width / 2, -height / 2, width, height);
        },
      },
    });

    register({
      profileId: 'station-wreck-small',
      category: 'wreck',
      size: { width: 110, height: 80 },
      cullRadius: 72,
      source: {
        type: 'procedural',
        drawFn: (ctx, width, height) => {
          ctx.fillStyle = '#ff8a65';
          ctx.fillRect(-width / 2, -height / 2, width, height);
          ctx.strokeStyle = '#1f2937';
          ctx.lineWidth = 2;
          ctx.strokeRect(-width / 2, -height / 2, width, height);
        },
      },
    });

    register({
      profileId: 'ship-wreck-small',
      category: 'wreck',
      size: { width: 90, height: 56 },
      cullRadius: 66,
      source: {
        type: 'procedural',
        drawFn: (ctx, width, height) => {
          ctx.fillStyle = '#d0a2f7';
          ctx.fillRect(-width / 2, -height / 2, width, height);
          ctx.strokeStyle = '#1f2937';
          ctx.lineWidth = 2;
          ctx.strokeRect(-width / 2, -height / 2, width, height);
        },
      },
    });

  }

  private registerDevOverlaySections(overlay: DevOverlayLike): void {
    const entitiesSection = overlay.registerSection('entities', 'Entities');
    entitiesSection.registerMetric('total', 'total', () => this.entityManager.size);

    const categories = ['ship', 'station', 'gate', 'wreck', 'projectile', 'celestial', 'environment'] as const;
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
    systemSection.registerMetric('system', 'system', () => this.currentSystemId || '-');
    systemSection.registerMetric('entities', 'entities', () => this.entityManager.size);
    systemSection.registerMetric('asteroids', 'asteroids', () => this.getAsteroidCount());
    systemSection.registerMetric('load-time', 'load time', () => {
      if (!this.lastLoadResult) {
        return '-';
      }

      return `${this.lastLoadResult.loadTimeMs.toFixed(1)} ms`;
    });
    systemSection.registerMetric('warnings', 'warnings', () => this.lastLoadResult?.warnings.length ?? 0);
    systemSection.registerMetric('errors', 'errors', () => this.lastLoadResult?.errors.length ?? 0);

    const spriteTestSection = overlay.registerSection('sprite-test', 'Sprite Test');
    spriteTestSection.registerMetric('active', 'active', () => this.activeSpriteTestProfileId ?? '-');
    spriteTestSection.registerMetric('available', 'available', () => this.getSpriteProfileIds().length);
    spriteTestSection.registerControl('spawn-next', 'Spawn next sprite', 'button', undefined, () => {
      this.spawnNextSpriteTestEntity();
    });
    spriteTestSection.registerControl('clear-sprite-test', 'Clear sprite test', 'button', undefined, () => {
      this.clearSpriteTestEntity();
    });

    const devFlagsSection = overlay.registerSection('dev-flags', 'Dev Flags');
    devFlagsSection.registerControl(
      'test-entity',
      'Test entity',
      'checkbox',
      this.readLocalStorageBoolean(DEV_TEST_ENTITY_STORAGE_KEY, false),
      (enabled: boolean) => {
        this.setDevTestEntityEnabled(enabled);
      },
    );

    this.refreshDevSpawnSection();
  }

  private refreshDevSpawnSection(): void {
    if (!this.devOverlay) {
      return;
    }

    this.devOverlay.removeSection('dev-spawn');

    const availableProfiles = this.getDevSpawnProfiles(this.devSpawnType);
    if (availableProfiles.length > 0 && !availableProfiles.some((profile) => profile.value === this.devSpawnProfileId)) {
      this.devSpawnProfileId = availableProfiles[0].value;
    }

    if (availableProfiles.length === 0) {
      this.devSpawnProfileId = '';
    }

    const orbitAroundOptions = this.getDevSpawnOrbitAroundOptions();
    if (!orbitAroundOptions.some((option) => option.value === this.devSpawnOrbitAroundId)) {
      this.devSpawnOrbitAroundId = 'center';
    }

    const section = this.devOverlay.registerSection('dev-spawn', 'Dev Spawn');
    section.registerControl('type', 'type', 'select', this.devSpawnType, (value: string) => {
      this.devSpawnType = value as SeedObjectType;
      this.devSpawnHeight = SEED_OBJECT_BASE_HEIGHT[this.devSpawnType];
      const nextProfiles = this.getDevSpawnProfiles(this.devSpawnType);
      this.devSpawnProfileId = nextProfiles[0]?.value ?? '';
      this.refreshDevSpawnSection();
    }, this.getDevSpawnTypeOptions());
    section.registerControl('profileId', 'profileId', 'select', this.devSpawnProfileId, (value: string) => {
      this.devSpawnProfileId = value;
    }, availableProfiles);
    section.registerControl('orbitRadius', 'orbitRadius', 'number', this.devSpawnOrbitRadius, (value: number) => {
      this.devSpawnOrbitRadius = value;
    }, { min: 0, step: 10 });
    section.registerControl('orbitPhase', 'orbitPhase', 'number', this.devSpawnOrbitPhase, (value: number) => {
      this.devSpawnOrbitPhase = value;
    }, { min: 0, max: 360, step: 1 });
    section.registerControl('orbitAround', 'orbitAround', 'select', this.devSpawnOrbitAroundId, (value: string) => {
      this.devSpawnOrbitAroundId = value;
    }, orbitAroundOptions);
    section.registerControl('height', 'height', 'number', this.devSpawnHeight, (value: number) => {
      this.devSpawnHeight = value;
    }, { min: 1, step: 0.1 });
    section.registerControl('spawn', 'Spawn', 'button', undefined, () => {
      this.spawnDevEntity();
    });
  }

  private getDevSpawnTypeOptions(): Array<{ label: string; value: string }> {
    return [
      { label: 'star', value: 'star' },
      { label: 'planet', value: 'planet' },
      { label: 'moon', value: 'moon' },
      { label: 'gate', value: 'gate' },
      { label: 'station-wreck', value: 'station-wreck' },
      { label: 'station', value: 'station' },
      { label: 'container', value: 'container' },
      { label: 'ship-wreck', value: 'ship-wreck' },
      { label: 'npc-ship', value: 'npc-ship' },
      { label: 'player-ship', value: 'player-ship' },
    ];
  }

  private getDevSpawnProfiles(type: SeedObjectType): Array<{ label: string; value: string }> {
    const category = SEED_TYPE_TO_CATEGORY[type];
    return this.visualProfileRegistry
      .getAll()
      .filter((profile) => profile.category === category)
      .map((profile) => ({ label: profile.profileId, value: profile.profileId }));
  }

  private getDevSpawnOrbitAroundOptions(): Array<{ label: string; value: string }> {
    return [
      { label: 'center', value: 'center' },
      ...this.entityManager.getAll().map((entity) => ({ label: entity.id, value: entity.id })),
    ];
  }

  private getAsteroidCount(): number {
    return this.entityManager.getAll().filter((entity) => {
      const candidate = entity as GameEntity & { seedType?: string };
      return candidate.seedType === 'asteroid';
    }).length;
  }

  private spawnDevEntity(): void {
    const profile = this.resolveDevSpawnProfile();
    const parentPosition = this.getDevSpawnParentPosition();
    const position = computeOrbitPosition(parentPosition, this.devSpawnOrbitRadius, this.devSpawnOrbitPhase);
    const height = this.normalizeDevSpawnHeight(this.devSpawnType, this.devSpawnHeight);
    const computedHeight = height;
    const entityId = this.getNextDevSpawnEntityId();
    const isStatic = this.devSpawnType !== 'npc-ship' && this.devSpawnType !== 'player-ship';

    const entity = new WorldEntity({
      id: entityId,
      category: SEED_TYPE_TO_CATEGORY[this.devSpawnType],
      seedType: this.devSpawnType,
      position,
      width: profile.size.width,
      height: profile.size.height,
      computedHeight,
      isStatic,
      profileId: profile.profileId,
    });

    this.entityManager.add(entity);
    const renderable = this.renderableFactory.create(entity, profile);
    renderable.computedHeight = computedHeight;
    this.renderablesByEntityId.set(entity.id, renderable);
    this.worldLayer.addRenderable(renderable);
    this.refreshDevSpawnSection();
  }

  private resolveDevSpawnProfile(): VisualProfile {
    const fallbackType = this.devSpawnType;
    const category = SEED_TYPE_TO_CATEGORY[fallbackType];
    const profile = this.visualProfileRegistry.get(this.devSpawnProfileId);
    if (profile && profile.category === category) {
      return profile;
    }

    const fallbackProfileId = `dev-fallback-${fallbackType}`;
    if (!profile) {
      console.warn(`[AppShell] Missing profile for dev spawn: ${this.devSpawnProfileId}, using fallback.`);
    } else {
      console.warn(`[AppShell] Profile category mismatch for dev spawn: ${this.devSpawnProfileId}, using fallback.`);
    }

    return {
      profileId: fallbackProfileId,
      category,
      size: this.getDevSpawnFallbackSize(fallbackType),
      cullRadius: this.getDevSpawnFallbackCullRadius(fallbackType),
      source: {
        type: 'procedural',
        drawFn: (ctx, width, height) => {
          ctx.fillStyle = this.getDevSpawnFallbackColor(fallbackType);
          ctx.fillRect(-width / 2, -height / 2, width, height);
          ctx.fillStyle = '#0f172a';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fallbackType, 0, 0);
        },
      },
    };
  }

  private getDevSpawnFallbackSize(type: SeedObjectType): { width: number; height: number } {
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

    return sizes[type];
  }

  private getDevSpawnFallbackCullRadius(type: SeedObjectType): number {
    const size = this.getDevSpawnFallbackSize(type);
    return Math.max(size.width, size.height) / 2;
  }

  private getDevSpawnFallbackColor(type: SeedObjectType): string {
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

    return colors[type];
  }

  private getDevSpawnParentPosition(): { x: number; y: number } {
    if (this.devSpawnOrbitAroundId === 'center') {
      return { x: 0, y: 0 };
    }

    const parent = this.entityManager.get(this.devSpawnOrbitAroundId);
    if (!parent) {
      console.warn(`[AppShell] Missing orbitAround entity: ${this.devSpawnOrbitAroundId}, falling back to center.`);
      return { x: 0, y: 0 };
    }

    return { ...parent.position };
  }

  private getNextDevSpawnEntityId(): string {
    let nextId = `dev-spawn-${this.devSpawnSequence += 1}`;
    while (this.entityManager.has(nextId)) {
      nextId = `dev-spawn-${this.devSpawnSequence += 1}`;
    }

    return nextId;
  }

  private normalizeDevSpawnHeight(type: SeedObjectType, value: number): number {
    const baseHeight = SEED_OBJECT_BASE_HEIGHT[type];
    if (type === 'player-ship' && value < SEED_OBJECT_BASE_HEIGHT['player-ship']) {
      return SEED_OBJECT_BASE_HEIGHT['player-ship'];
    }

    return value > 0 ? value : baseHeight;
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
