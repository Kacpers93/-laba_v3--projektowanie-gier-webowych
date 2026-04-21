/**
 * ReactorPanel – lewy górny HUD.
 * Wyświetla nazwę reaktora, zużycie mocy i poziom paliwa.
 */

import type { ReactorPayload } from '../../types/hudTypes';

const STALE_TICK_THRESHOLD = 2;

export class ReactorPanel {
  private readonly root: HTMLDivElement;
  private lastDataTick = -1;
  private lastPayload: ReactorPayload | null = null;
  private staleTicks = 0;

  public constructor() {
    this.root = document.createElement('div');
    this.root.id = 'hud-reactor';
    this.root.className = 'hud-panel hud-panel--top-left';
    this.root.innerHTML = this.buildSkeleton();
  }

  public mount(parent: HTMLElement): void {
    parent.append(this.root);
  }

  public unmount(): void {
    this.root.remove();
  }

  public update(payload: ReactorPayload | null, tick: number): void {
    if (payload === null) {
      this.staleTicks += 1;
    } else {
      this.lastPayload = payload;
      this.lastDataTick = tick;
      this.staleTicks = 0;
    }

    const isStale = this.staleTicks >= STALE_TICK_THRESHOLD;
    const data = this.lastPayload;

    this.root.classList.toggle('hud-panel--stale', isStale && data === null);

    if (!data) {
      this.renderNA();
      return;
    }

    this.renderData(data, isStale);
  }

  private renderData(data: ReactorPayload, stale: boolean): void {
    const nameEl = this.root.querySelector<HTMLElement>('.reactor-name');
    const maxEl = this.root.querySelector<HTMLElement>('.reactor-max');
    const usageBarEl = this.root.querySelector<HTMLElement>('.reactor-usage-bar-fill');
    const usageTextEl = this.root.querySelector<HTMLElement>('.reactor-usage-text');
    const fuelBarEl = this.root.querySelector<HTMLElement>('.reactor-fuel-bar-fill');
    const fuelTextEl = this.root.querySelector<HTMLElement>('.reactor-fuel-text');
    const staleEl = this.root.querySelector<HTMLElement>('.reactor-stale');

    if (nameEl) nameEl.textContent = data.name;
    if (maxEl) maxEl.textContent = `${data.maxOutputMw} MW`;

    const usagePct = Math.max(0, Math.min(100, data.currentUsagePct));
    if (usageBarEl) {
      usageBarEl.style.width = `${usagePct}%`;
      usageBarEl.style.background = usagePct > 80 ? '#ff6b35' : usagePct > 50 ? '#f7c59f' : '#3dffa0';
    }
    if (usageTextEl) {
      usageTextEl.textContent = `${data.currentUsageMw} MW  ${usagePct.toFixed(0)}%`;
    }

    const fuelPct = Math.max(0, Math.min(100, data.fuel.pct));
    if (fuelBarEl) {
      fuelBarEl.style.width = `${fuelPct}%`;
      fuelBarEl.style.background = fuelPct < 20 ? '#ff4444' : fuelPct < 40 ? '#f7c59f' : '#3dffa0';
    }
    if (fuelTextEl) {
      fuelTextEl.textContent = `${data.fuel.currentUnits} / ${data.fuel.maxUnits}  ${fuelPct.toFixed(0)}%`;
    }

    if (staleEl) staleEl.style.display = stale ? 'block' : 'none';
  }

  private renderNA(): void {
    const nameEl = this.root.querySelector<HTMLElement>('.reactor-name');
    const maxEl = this.root.querySelector<HTMLElement>('.reactor-max');
    const usageBarEl = this.root.querySelector<HTMLElement>('.reactor-usage-bar-fill');
    const usageTextEl = this.root.querySelector<HTMLElement>('.reactor-usage-text');
    const fuelBarEl = this.root.querySelector<HTMLElement>('.reactor-fuel-bar-fill');
    const fuelTextEl = this.root.querySelector<HTMLElement>('.reactor-fuel-text');

    if (nameEl) nameEl.textContent = 'N/A';
    if (maxEl) maxEl.textContent = '— MW';
    if (usageBarEl) usageBarEl.style.width = '0%';
    if (usageTextEl) usageTextEl.textContent = 'N/A';
    if (fuelBarEl) fuelBarEl.style.width = '0%';
    if (fuelTextEl) fuelTextEl.textContent = 'N/A';
  }

  private buildSkeleton(): string {
    return `
      <div class="hud-panel-inner">
        <div class="reactor-header">
          <span class="reactor-icon">⚡</span>
          <span class="reactor-name">—</span>
          <span class="reactor-max">— MW</span>
        </div>
        <div class="reactor-row">
          <span class="reactor-row-label">PWR</span>
          <div class="reactor-bar">
            <div class="reactor-usage-bar-fill"></div>
          </div>
          <span class="reactor-usage-text">—</span>
        </div>
        <div class="reactor-row">
          <span class="reactor-row-label">FUEL</span>
          <div class="reactor-bar">
            <div class="reactor-fuel-bar-fill"></div>
          </div>
          <span class="reactor-fuel-text">—</span>
        </div>
        <div class="reactor-stale" style="display:none">STALE</div>
      </div>
    `;
  }
}
