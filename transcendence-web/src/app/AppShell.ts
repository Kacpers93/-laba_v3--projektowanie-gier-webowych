import { AudioManager } from '@engine/audio/AudioManager';
import { GameInput } from '@engine/input/GameInput';
import { InputModeManager } from '@engine/input/InputModeManager';
import { UIInput } from '@engine/input/UIInput';
import { GameLoop } from '@engine/loop/GameLoop';
import { Camera } from '@engine/renderer/Camera';
import { Renderer } from '@engine/renderer/Renderer';
import { BaseEntity, EntityManager } from '@entities/base';
import type { GameEntity } from '@entities/base';
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

const CAMERA_SPEED = 220;
const DEV_TEST_ENTITY_ENABLED = true;

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
  private readonly cache: OffscreenCache;
  private readonly backgroundLayer: BackgroundLayer;
  private readonly parallaxLayer: ParallaxLayer;
  private readonly worldLayer: WorldLayer;
  private readonly renderablesByEntityId = new Map<string, Renderable>();

  private readonly hudLayer: HTMLDivElement;
  private readonly screenLayer: HTMLDivElement;
  private readonly camera: Camera;
  private readonly gameInput: GameInput;
  private readonly uiInput: UIInput;

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
    this.renderableFactory = new RenderableFactory(this.cache);

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

    this.registerDevVisualProfiles();
    this.registerDevTestEntity();
    this.exposeDevTools();

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

  public start(): void {
    if (this.started) {
      return;
    }

    this.started = true;
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
    if (!DEV_TEST_ENTITY_ENABLED) {
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
      };
    };

    devTarget.__dev = {
      entityManager: this.entityManager,
      worldLayer: this.worldLayer,
    };
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
