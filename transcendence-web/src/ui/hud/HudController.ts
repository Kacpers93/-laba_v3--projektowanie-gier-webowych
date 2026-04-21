/**
 * HudController – montuje i aktualizuje 4 panele HUD w #hud-layer.
 * Każdy panel ma własny `lastDataTick` i kryterium `nieodswiezony`.
 */

import type { HudContext } from '../types/hudTypes';
import { RadarPanel } from './panels/RadarPanel';
import { ReactorPanel } from './panels/ReactorPanel';
import { ShipStatusPanel } from './panels/ShipStatusPanel';
import { TargetPanel } from './panels/TargetPanel';

export class HudController {
  private readonly reactorPanel: ReactorPanel;
  private readonly radarPanel: RadarPanel;
  private readonly shipStatusPanel: ShipStatusPanel;
  private readonly targetPanel: TargetPanel;

  private mounted = false;
  private tick = 0;

  public constructor() {
    this.reactorPanel = new ReactorPanel();
    this.radarPanel = new RadarPanel();
    this.shipStatusPanel = new ShipStatusPanel();
    this.targetPanel = new TargetPanel();
  }

  public mount(hudLayer: HTMLElement): void {
    if (this.mounted) {
      return;
    }

    this.reactorPanel.mount(hudLayer);
    this.radarPanel.mount(hudLayer);
    this.shipStatusPanel.mount(hudLayer);
    this.targetPanel.mount(hudLayer);
    this.mounted = true;
  }

  public unmount(): void {
    if (!this.mounted) {
      return;
    }

    this.reactorPanel.unmount();
    this.radarPanel.unmount();
    this.shipStatusPanel.unmount();
    this.targetPanel.unmount();
    this.mounted = false;
  }

  /**
   * Aktualizuje wszystkie panele HUD.
   * Wywolywane z AppShell co tick (onFrameUpdate lub onFixedUpdate).
   */
  public update(context: HudContext | null): void {
    this.tick += 1;

    try {
      this.reactorPanel.update(context?.reactor ?? null, this.tick);
    } catch (e) {
      console.error('[HudController] ReactorPanel error:', e);
    }

    try {
      this.radarPanel.update(context?.radar ?? null, this.tick);
    } catch (e) {
      console.error('[HudController] RadarPanel error:', e);
    }

    try {
      this.shipStatusPanel.update(context?.shipStatus ?? null, this.tick);
    } catch (e) {
      console.error('[HudController] ShipStatusPanel error:', e);
    }

    try {
      this.targetPanel.update(context?.target ?? null, this.tick);
    } catch (e) {
      console.error('[HudController] TargetPanel error:', e);
    }
  }
}
