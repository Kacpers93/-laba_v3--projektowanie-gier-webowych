/**
 * RadarPanel – prawy górny HUD.
 * Renderuje okrągły mini radar z kontaktami w low-res.
 */

import { RADAR_RELATION_COLORS } from '../../types/hudTypes';
import type { RadarContact, RadarPayload } from '../../types/hudTypes';

const RADAR_SIZE = 160; // px (canvas)
const RADAR_HALF = RADAR_SIZE / 2;
const STALE_TICK_THRESHOLD = 2;

/** Rozmiar pikseli kontaktow wg typu. */
function getContactSize(type: RadarContact['type']): number {
  switch (type) {
    case 'star':
    case 'planet':
    case 'station':
      return 5;
    case 'asteroid':
      return 2;
    default:
      return 1;
  }
}

export class RadarPanel {
  private readonly root: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private lastPayload: RadarPayload | null = null;
  private staleTicks = 0;

  public constructor() {
    this.root = document.createElement('div');
    this.root.id = 'hud-radar';
    this.root.className = 'hud-panel hud-panel--top-right';

    const label = document.createElement('div');
    label.className = 'hud-panel-label';
    label.textContent = 'RADAR';

    this.canvas = document.createElement('canvas');
    this.canvas.width = RADAR_SIZE;
    this.canvas.height = RADAR_SIZE;
    this.canvas.className = 'radar-canvas';

    const inner = document.createElement('div');
    inner.className = 'hud-panel-inner radar-inner';
    inner.append(label, this.canvas);
    this.root.append(inner);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('[RadarPanel] Cannot get 2D context.');
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

  public update(payload: RadarPayload | null, tick: number): void {
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
      return;
    }

    this.drawRadar(this.lastPayload, isStale);
  }

  private drawRadar(payload: RadarPayload, stale: boolean): void {
    this.ctx.clearRect(0, 0, RADAR_SIZE, RADAR_SIZE);

    // Tlo kola
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(RADAR_HALF, RADAR_HALF, RADAR_HALF - 1, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 18, 6, 0.85)';
    this.ctx.fill();

    // Obramowanie
    this.ctx.strokeStyle = '#1a5533';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    this.ctx.restore();

    // Siatka (2 okragI)
    [0.33, 0.66].forEach((r) => {
      this.ctx.beginPath();
      this.ctx.arc(RADAR_HALF, RADAR_HALF, (RADAR_HALF - 2) * r, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(61, 255, 160, 0.12)';
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke();
    });

    // Linie krzyzowe
    this.ctx.strokeStyle = 'rgba(61, 255, 160, 0.1)';
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    this.ctx.moveTo(RADAR_HALF, 2);
    this.ctx.lineTo(RADAR_HALF, RADAR_SIZE - 2);
    this.ctx.moveTo(2, RADAR_HALF);
    this.ctx.lineTo(RADAR_SIZE - 2, RADAR_HALF);
    this.ctx.stroke();

    if (!payload) {
      return;
    }

    const effectiveRange = Math.max(
      payload.rangeUnits,
      300,
    );

    // Filtracja kontaktow: tylko aktywne i w zasiegu
    const cx = payload.centerWorld.x;
    const cy = payload.centerWorld.y;

    const filtered = payload.contacts.filter((c) => {
      if (!c.active) return false;
      const dist = Math.hypot(c.worldX - cx, c.worldY - cy);
      return dist <= effectiveRange;
    });

    // Clip do kola
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(RADAR_HALF, RADAR_HALF, RADAR_HALF - 2, 0, Math.PI * 2);
    this.ctx.clip();

    for (const contact of filtered) {
      const dx = contact.worldX - cx;
      const dy = contact.worldY - cy;

      const screenX = RADAR_HALF + (dx / effectiveRange) * (RADAR_HALF - 4);
      const screenY = RADAR_HALF + (dy / effectiveRange) * (RADAR_HALF - 4);

      const color = RADAR_RELATION_COLORS[contact.relation];
      const size = getContactSize(contact.type);

      this.ctx.fillStyle = color;
      if (size === 1) {
        this.ctx.fillRect(screenX - 0.5, screenY - 0.5, 1, 1);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.restore();

    // Centrum - gracz
    this.ctx.fillStyle = '#3dffa0';
    this.ctx.beginPath();
    this.ctx.arc(RADAR_HALF, RADAR_HALF, 2, 0, Math.PI * 2);
    this.ctx.fill();

    if (stale) {
      this.drawStaleOverlay();
    }
  }

  private drawEmpty(): void {
    this.ctx.clearRect(0, 0, RADAR_SIZE, RADAR_SIZE);

    this.ctx.beginPath();
    this.ctx.arc(RADAR_HALF, RADAR_HALF, RADAR_HALF - 1, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 18, 6, 0.85)';
    this.ctx.fill();
    this.ctx.strokeStyle = '#1a5533';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(61, 255, 160, 0.3)';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('NO SIGNAL', RADAR_HALF, RADAR_HALF);
    this.ctx.textAlign = 'start';
    this.ctx.textBaseline = 'alphabetic';
  }

  private drawStaleOverlay(): void {
    this.ctx.fillStyle = 'rgba(255, 68, 68, 0.15)';
    this.ctx.fillRect(0, 0, RADAR_SIZE, RADAR_SIZE);

    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = '9px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('STALE', RADAR_HALF, RADAR_SIZE - 8);
    this.ctx.textAlign = 'start';
  }
}
