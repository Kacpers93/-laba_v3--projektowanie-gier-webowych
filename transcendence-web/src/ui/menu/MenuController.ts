/**
 * MenuController – zarządza stanem nawigacji menu i obsługą klawiszy.
 * Pauzuje symulację (tryb 'ui') przy otwarciu menu obiektowego.
 * Wznawia (tryb 'game') po zamknięciu.
 */

import type { InputModeManager } from '@engine/input/InputModeManager';
import { resolveMenuProfile } from '../types/menuTypes';
import type { MenuContext, MenuObjectType, MenuProfileId, ObjectState, RuntimeMenuNode } from '../types/menuTypes';
import type { MenuRegistry } from './MenuRegistry';
import { MenuRuntimeBuilder } from './MenuRuntimeBuilder';
import type { MenuView } from './MenuView';

// Prog dokowania (etap 6)
const DOCK_INTERACTION_DISTANCE_PX = 20;

export interface DockableTarget {
  id: string;
  objectType: MenuObjectType;
  objectState: ObjectState;
  sceneLabel: string;
  dockable: boolean;
  /** AABB obiektu dokowalnego w przestrzeni ekranu (px). */
  screenBounds: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface PlayerScreenBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class MenuController {
  private readonly registry: MenuRegistry;
  private readonly builder: MenuRuntimeBuilder;
  private readonly view: MenuView;
  private readonly inputModeManager: InputModeManager;

  private isOpen = false;
  private activeProfileId: MenuProfileId | null = null;
  private activeContext: MenuContext | null = null;

  /** Stos poziomow nawigacji: kazdy poziom to lista wezlow + aktywny indeks. */
  private navigationStack: Array<{ nodes: RuntimeMenuNode[]; activeIndex: number; label: string }> = [];

  private readonly keydownHandler: (e: KeyboardEvent) => void;

  public constructor(registry: MenuRegistry, view: MenuView, inputModeManager: InputModeManager) {
    this.registry = registry;
    this.builder = new MenuRuntimeBuilder(registry);
    this.view = view;
    this.inputModeManager = inputModeManager;

    this.keydownHandler = this.handleKeydown.bind(this);
  }

  // ---------------------------------------------------------------------------
  // API publiczne
  // ---------------------------------------------------------------------------

  /** Otwiera menu obiektowe dla podanego kontekstu. */
  public openObjectMenu(context: MenuContext): void {
    const nodes = this.builder.build(context.menuProfile, context.availableNodes);
    if (nodes.length === 0) {
      console.warn(`[MenuController] No nodes for profile: ${context.menuProfile}`);
      return;
    }

    this.activeContext = context;
    this.activeProfileId = context.menuProfile;
    this.navigationStack = [{ nodes, activeIndex: 0, label: context.sceneLabel }];

    this.inputModeManager.setMode('ui');
    this.open();
  }

  /** Otwiera menu gry (profil 'game-menu'). */
  public openGameMenu(): void {
    const nodes = this.builder.build('game-menu');
    if (nodes.length === 0) {
      return;
    }

    this.activeContext = {
      objectType: 'gameMenu',
      objectState: 'active',
      menuProfile: 'game-menu',
      availableNodes: [],
      sceneLabel: 'Game Menu',
    };
    this.activeProfileId = 'game-menu';
    this.navigationStack = [{ nodes, activeIndex: 0, label: 'Game Menu' }];

    this.inputModeManager.setMode('ui');
    this.open();
  }

  /**
   * Otwiera menu statku gracza ('playerShip.default').
   */
  public openPlayerShipMenu(sceneLabel: string): void {
    const profileId = resolveMenuProfile('playerShip', 'active');
    const nodes = this.builder.build(profileId);
    if (nodes.length === 0) {
      return;
    }

    this.activeContext = {
      objectType: 'playerShip',
      objectState: 'active',
      menuProfile: profileId,
      availableNodes: [],
      sceneLabel,
    };
    this.activeProfileId = profileId;
    this.navigationStack = [{ nodes, activeIndex: 0, label: sceneLabel }];

    this.inputModeManager.setMode('ui');
    this.open();
  }

  /**
   * Próbuje dokować do obiektu. Sprawdza zasięg i flagę dockable.
   * @returns true jesli dokowanie sie powiodlo
   */
  public tryDock(
    target: DockableTarget,
    playerBounds: PlayerScreenBounds,
  ): boolean {
    if (!target.dockable) {
      return false;
    }

    const dist = this.boundsDistance(playerBounds, target.screenBounds);
    if (dist > DOCK_INTERACTION_DISTANCE_PX) {
      return false;
    }

    const profileId = resolveMenuProfile(target.objectType, target.objectState);
    const nodes = this.builder.build(profileId);

    this.activeContext = {
      objectType: target.objectType,
      objectState: target.objectState,
      menuProfile: profileId,
      availableNodes: [],
      sceneLabel: target.sceneLabel,
    };
    this.activeProfileId = profileId;
    this.navigationStack = [{ nodes, activeIndex: 0, label: target.sceneLabel }];

    this.inputModeManager.setMode('ui');
    this.open();
    return true;
  }

  /** Zamyka menu i wznawia symulację. */
  public close(): void {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.activeProfileId = null;
    this.activeContext = null;
    this.navigationStack = [];

    this.view.hide();
    this.inputModeManager.setMode('game');
    window.removeEventListener('keydown', this.keydownHandler);
  }

  public get isMenuOpen(): boolean {
    return this.isOpen;
  }

  // ---------------------------------------------------------------------------
  // Wewnętrzne
  // ---------------------------------------------------------------------------

  private open(): void {
    if (!this.isOpen) {
      window.addEventListener('keydown', this.keydownHandler);
    }

    this.isOpen = true;
    this.view.show();
    this.renderCurrent();
  }

  private renderCurrent(): void {
    const frame = this.currentFrame();
    if (!frame) {
      return;
    }

    const breadcrumb = this.navigationStack.slice(0, -1).map((f) => f.label);
    const activeNode = frame.nodes[frame.activeIndex];
    const description = activeNode?.description ?? this.activeContext?.sceneDescription;

    this.view.render(
      this.activeContext?.sceneLabel ?? '',
      breadcrumb,
      frame.nodes,
      frame.activeIndex,
      description,
    );
  }

  private currentFrame(): { nodes: RuntimeMenuNode[]; activeIndex: number; label: string } | null {
    return this.navigationStack[this.navigationStack.length - 1] ?? null;
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) {
      return;
    }

    const frame = this.currentFrame();
    if (!frame) {
      return;
    }

    const key = event.key;

    if (key === 'ArrowUp') {
      event.preventDefault();
      frame.activeIndex = (frame.activeIndex - 1 + frame.nodes.length) % frame.nodes.length;
      this.view.setActiveIndex(frame.activeIndex);
      const activeNode = frame.nodes[frame.activeIndex];
      this.view.setContentDescription(activeNode?.description ?? this.activeContext?.sceneDescription);
      return;
    }

    if (key === 'ArrowDown') {
      event.preventDefault();
      frame.activeIndex = (frame.activeIndex + 1) % frame.nodes.length;
      this.view.setActiveIndex(frame.activeIndex);
      const activeNode = frame.nodes[frame.activeIndex];
      this.view.setContentDescription(activeNode?.description ?? this.activeContext?.sceneDescription);
      return;
    }

    if (key === 'Enter') {
      event.preventDefault();
      const node = frame.nodes[frame.activeIndex];
      if (node) {
        this.selectNode(node);
      }
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      this.goBack();
      return;
    }

    // Skroty literowe
    const lowerKey = key.toLowerCase();
    const matchedIndex = frame.nodes.findIndex((n) => n.hotkey === lowerKey);
    if (matchedIndex !== -1) {
      event.preventDefault();
      frame.activeIndex = matchedIndex;
      this.view.setActiveIndex(matchedIndex);
      const node = frame.nodes[matchedIndex];
      if (node) {
        this.selectNode(node);
      }
    }
  }

  private selectNode(node: RuntimeMenuNode): void {
    if (!node.isLeaf && node.children.length > 0) {
      // Wejscie do podmenu
      this.navigationStack.push({
        nodes: node.children,
        activeIndex: 0,
        label: node.label,
      });
      this.renderCurrent();
      return;
    }

    // Akcja lisciowa
    if (node.action) {
      this.handleAction(node.action);
    }
  }

  private goBack(): void {
    if (this.navigationStack.length <= 1) {
      // Poziom bazowy – zamknij menu
      this.close();
      return;
    }

    this.navigationStack.pop();
    this.renderCurrent();
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'close-menu':
      case 'resume-game':
        this.close();
        break;

      default:
        // Inne akcje – emituj zdarzenie domenowe (obsluzone przez AppShell)
        const event = new CustomEvent('menu-action', { detail: { action } });
        window.dispatchEvent(event);
        console.log(`[MenuController] action: ${action}`);
        break;
    }
  }

  /** Odleglosc miedzy dwoma AABB (0 gdy sie nakladaja). */
  private boundsDistance(
    a: PlayerScreenBounds,
    b: { minX: number; minY: number; maxX: number; maxY: number },
  ): number {
    const dx = Math.max(0, Math.max(a.minX - b.maxX, b.minX - a.maxX));
    const dy = Math.max(0, Math.max(a.minY - b.maxY, b.minY - a.maxY));
    return Math.sqrt(dx * dx + dy * dy);
  }
}
