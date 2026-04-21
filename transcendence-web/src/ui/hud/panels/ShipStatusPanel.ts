/**
 * ShipStatusPanel – prawy dolny HUD.
 * Renderuje pierścień osłony, segmenty pancerza i prędkość statku.
 */

import type { ArmorSegment, ShipStatusPayload } from '../../types/hudTypes';

const CANVAS_SIZE = 130;
const CENTER = CANVAS_SIZE / 2;
const SHIELD_RADIUS = 54;
const SHIELD_WIDTH = 5;
const ARMOR_RADIUS = 42;
const ARMOR_WIDTH = 8;
const STALE_TICK_THRESHOLD = 2;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export class ShipStatusPanel {
  private readonly root: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly velocityEl: HTMLSpanElement;
  private lastPayload: ShipStatusPayload | null = null;
  private staleTicks = 0;

  public constructor() {
    this.root = document.createElement('div');
    this.root.id = 'hud-ship-status';
    this.root.className = 'hud-panel hud-panel--bottom-right';

    const label = document.createElement('div');
    label.className = 'hud-panel-label';
    label.textContent = 'SHIP STATUS';

    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_SIZE;
    this.canvas.height = CANVAS_SIZE;
    this.canvas.className = 'ship-status-canvas';

    this.velocityEl = document.createElement('span');
    this.velocityEl.className = 'ship-velocity';
    this.velocityEl.textContent = '0 px/s';

    const inner = document.createElement('div');
    inner.className = 'hud-panel-inner ship-status-inner';
    inner.append(label, this.canvas, this.velocityEl);
    this.root.append(inner);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('[ShipStatusPanel] Cannot get 2D context.');
    }
    this.ctx = ctx;

    this.drawEmpty();
  }

  public mount(parent: HTMLElement): void {
    parent.append(this.root);
  }

  public unmount(): void {
    this.root.remove();
  }

  public update(payload: ShipStatusPayload | null, tick: number): void {
    if (payload === null) {
      this.staleTicks += 1;
    } else {
      this.lastPayload = payload;
      this.staleTicks = 0;
    }

    const isStale = this.staleTicks >= STALE_TICK_THRESHOLD;
    this.root.classList.toggle('hud-panel--stale', isStale && this.lastPayload === null);

    if (!this.lastPayload) {
      this.drawEmpty();
      this.velocityEl.textContent = 'N/A';
      return;
    }

    this.drawStatus(this.lastPayload, isStale);
  }

  private drawStatus(payload: ShipStatusPayload, stale: boolean): void {
    this.ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    this.drawShieldRing(payload);
    this.drawArmorSegments(payload.armor.segments);

    // Prędkość
    const speed = payload.velocity.currentPxPerSec;
    this.velocityEl.textContent = `${speed.toFixed(0)} px/s`;

    if (stale) {
      this.ctx.fillStyle = 'rgba(255, 68, 68, 0.12)';
      this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
  }

  private drawShieldRing(payload: ShipStatusPayload): void {
    const shield = payload.shield;

    // Tlo pierscienia
    this.ctx.beginPath();
    this.ctx.arc(CENTER, CENTER, SHIELD_RADIUS, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(61, 255, 160, 0.15)';
    this.ctx.lineWidth = SHIELD_WIDTH;
    this.ctx.stroke();

    if (shield.maxHp <= 0) {
      return;
    }

    const pct = Math.max(0, Math.min(1, shield.currentHp / shield.maxHp));
    const startRad = degToRad(shield.ringStartDeg);
    const endRad = startRad + pct * Math.PI * 2;

    this.ctx.beginPath();
    this.ctx.arc(CENTER, CENTER, SHIELD_RADIUS, startRad, endRad);

    const color = pct > 0.5 ? '#3dffa0' : pct > 0.25 ? '#f7c59f' : '#ff4444';
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = SHIELD_WIDTH;
    this.ctx.stroke();

    // Etykieta
    this.ctx.fillStyle = 'rgba(61, 255, 160, 0.6)';
    this.ctx.font = '8px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`SH ${(pct * 100).toFixed(0)}%`, CENTER, CENTER - ARMOR_RADIUS - 6);
    this.ctx.textAlign = 'start';
  }

  private drawArmorSegments(segments: ArmorSegment[]): void {
    if (segments.length === 0) {
      this.ctx.fillStyle = 'rgba(61, 255, 160, 0.3)';
      this.ctx.font = '9px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('NO ARMOR', CENTER, CENTER);
      this.ctx.textBaseline = 'alphabetic';
      this.ctx.textAlign = 'start';
      return;
    }

    const gap = 2; // stopnie przerwy miedzy segmentami

    for (const seg of segments) {
      if (seg.maxHp <= 0) {
        continue;
      }

      const pct = Math.max(0, Math.min(1, seg.currentHp / seg.maxHp));

      const startRad = degToRad(seg.mountArcStartDeg - 90 + gap / 2);
      const sizeRad = degToRad(Math.max(0, seg.mountArcSizeDeg - gap));

      // Tlo segmentu
      this.ctx.beginPath();
      this.ctx.arc(CENTER, CENTER, ARMOR_RADIUS, startRad, startRad + sizeRad);
      this.ctx.strokeStyle = 'rgba(61, 255, 160, 0.15)';
      this.ctx.lineWidth = ARMOR_WIDTH;
      this.ctx.stroke();

      // Wypelnienie wg HP
      if (pct > 0) {
        this.ctx.beginPath();
        this.ctx.arc(CENTER, CENTER, ARMOR_RADIUS, startRad, startRad + sizeRad * pct);
        const color = pct > 0.5 ? '#3dffa0' : pct > 0.25 ? '#f7c59f' : '#ff4444';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = ARMOR_WIDTH;
        this.ctx.stroke();
      }
    }

    // Etykieta srednia
    const avgPct =
      segments.reduce((sum, s) => sum + (s.maxHp > 0 ? s.currentHp / s.maxHp : 0), 0) / segments.length;
    this.ctx.fillStyle = 'rgba(61, 255, 160, 0.6)';
    this.ctx.font = '8px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`AR ${(avgPct * 100).toFixed(0)}%`, CENTER, CENTER + 4);
    this.ctx.textAlign = 'start';
  }

  private drawEmpty(): void {
    this.ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Tlo pierscieni
    this.ctx.beginPath();
    this.ctx.arc(CENTER, CENTER, SHIELD_RADIUS, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(61, 255, 160, 0.08)';
    this.ctx.lineWidth = SHIELD_WIDTH;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(CENTER, CENTER, ARMOR_RADIUS, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(61, 255, 160, 0.08)';
    this.ctx.lineWidth = ARMOR_WIDTH;
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(61, 255, 160, 0.3)';
    this.ctx.font = '9px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('N/A', CENTER, CENTER);
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.textAlign = 'start';
  }
}
