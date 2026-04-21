/**
 * TargetPanel – lewy dolny HUD.
 * Wyświetla zaznaczony cel: typ, dystans, osłona, pancerz, relacja, kierunek.
 */

import type { TargetPayload } from '../../types/hudTypes';
import { RADAR_RELATION_COLORS } from '../../types/hudTypes';

const STALE_TICK_THRESHOLD = 2;

export class TargetPanel {
  private readonly root: HTMLDivElement;
  private readonly inner: HTMLDivElement;
  private lastPayload: TargetPayload | null = null;
  private staleTicks = 0;

  public constructor() {
    this.root = document.createElement('div');
    this.root.id = 'hud-target';
    this.root.className = 'hud-panel hud-panel--bottom-left';

    const label = document.createElement('div');
    label.className = 'hud-panel-label';
    label.textContent = 'TARGET';

    this.inner = document.createElement('div');
    this.inner.className = 'hud-panel-inner target-inner';
    this.inner.append(label);
    this.root.append(this.inner);

    this.renderEmpty();
  }

  public mount(parent: HTMLElement): void {
    parent.append(this.root);
  }

  public unmount(): void {
    this.root.remove();
  }

  public update(payload: TargetPayload | null, tick: number): void {
    if (payload === null) {
      this.staleTicks += 1;
    } else {
      this.lastPayload = payload;
      this.staleTicks = 0;
    }

    const isStale = this.staleTicks >= STALE_TICK_THRESHOLD;
    this.root.classList.toggle('hud-panel--stale', isStale && this.lastPayload === null);

    const data = this.lastPayload;

    if (!data || !data.selected) {
      this.renderEmpty();
      return;
    }

    this.renderTarget(data, isStale);
  }

  private renderTarget(data: TargetPayload, stale: boolean): void {
    const relationColor = data.relation ? RADAR_RELATION_COLORS[data.relation] : '#888888';

    const directionSvg = data.objectType === 'ship' && data.facingDeg !== null
      ? this.buildDirectionSvg(data.facingDeg)
      : '';

    const shieldBar = this.buildBar(data.shieldPct, '#3dffa0');
    const armorBar = this.buildBar(data.armorPct, '#f7c59f');

    this.inner.innerHTML = `
      <div class="hud-panel-label">TARGET</div>
      <div class="target-relation-badge" style="color:${relationColor}">${data.relation?.toUpperCase() ?? 'UNKNOWN'}</div>
      <div class="target-id">${data.objectId ?? '—'}</div>
      <div class="target-type">[${data.objectType?.toUpperCase() ?? '—'}]</div>
      ${directionSvg ? `<div class="target-direction">${directionSvg}</div>` : ''}
      <div class="target-stats">
        ${data.rangeUnits !== null ? `<div class="target-stat"><span>RANGE</span><span>${data.rangeUnits.toFixed(0)} u</span></div>` : ''}
        ${data.velocityPxPerSec !== null ? `<div class="target-stat"><span>VEL</span><span>${data.velocityPxPerSec.toFixed(0)} px/s</span></div>` : ''}
      </div>
      <div class="target-bars">
        <div class="target-bar-row"><span>SH</span>${shieldBar}</div>
        <div class="target-bar-row"><span>AR</span>${armorBar}</div>
      </div>
      ${stale ? '<div class="target-stale">STALE</div>' : ''}
    `;
  }

  private renderEmpty(): void {
    this.inner.innerHTML = `
      <div class="hud-panel-label">TARGET</div>
      <div class="target-empty">
        <span class="target-empty-text">NO TARGET</span>
      </div>
    `;
  }

  private buildBar(pct: number | null, color: string): string {
    if (pct === null) {
      return '<div class="stat-bar-track"><span class="stat-bar-na">N/A</span></div>';
    }
    const clamped = Math.max(0, Math.min(100, pct));
    const barColor = clamped > 50 ? color : clamped > 25 ? '#f7c59f' : '#ff4444';
    return `
      <div class="stat-bar-track">
        <div class="stat-bar-fill" style="width:${clamped}%;background:${barColor}"></div>
        <span class="stat-bar-text">${clamped.toFixed(0)}%</span>
      </div>
    `;
  }

  private buildDirectionSvg(facingDeg: number): string {
    return `
      <svg class="target-dir-svg" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="12" stroke="rgba(61,255,160,0.2)" stroke-width="1" fill="none"/>
        <g transform="rotate(${facingDeg} 14 14)">
          <polygon points="14,3 18,22 14,18 10,22" fill="#3dffa0" opacity="0.9"/>
        </g>
      </svg>
    `;
  }
}
