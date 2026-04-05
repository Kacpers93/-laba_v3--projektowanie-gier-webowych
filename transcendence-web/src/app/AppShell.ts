import { AudioManager } from '@engine/audio/AudioManager';
import { GameInput } from '@engine/input/GameInput';
import { InputModeManager } from '@engine/input/InputModeManager';
import { UIInput } from '@engine/input/UIInput';
import { GameLoop } from '@engine/loop/GameLoop';
import { Camera } from '@engine/renderer/Camera';
import { Renderer } from '@engine/renderer/Renderer';
import { OffscreenCache } from '@/presentation/cache/OffscreenCache';
import { SceneRenderer } from '@/presentation/scene/SceneRenderer';
import { BackgroundLayer } from '@/presentation/scene/BackgroundLayer';
import { ParallaxLayer } from '../presentation/scene/ParallaxLayer';
import { ACTIVE_PARALLAX_SUBLAYERS } from '@/presentation/scene/parallax-presets';
import { WorldLayer } from '@/presentation/scene/WorldLayer';
import { EffectsLayer } from '@/presentation/scene/EffectsLayer';
import { DebugLayer } from '@/presentation/scene/DebugLayer';

const CAMERA_SPEED = 220;

export class AppShell {
  public readonly canvas: HTMLCanvasElement;
  public readonly renderer: Renderer;
  public readonly gameLoop: GameLoop;
  public readonly audioManager: AudioManager;
  public readonly inputModeManager: InputModeManager;
  public readonly sceneRenderer: SceneRenderer;
  private readonly cache: OffscreenCache;
  private readonly backgroundLayer: BackgroundLayer;
  private readonly parallaxLayer: ParallaxLayer;

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

    this.sceneRenderer.addLayer(new WorldLayer());
    this.sceneRenderer.addLayer(new EffectsLayer());
    this.sceneRenderer.addLayer(new DebugLayer());

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

  private readonly onFrameUpdate = (_dt: number, _alpha: number): void => {
    this.sceneRenderer.update(_dt, this.camera);
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
}
