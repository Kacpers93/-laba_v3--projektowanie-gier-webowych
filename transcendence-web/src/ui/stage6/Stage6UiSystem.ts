import type { InputModeManager } from '@engine/input/InputModeManager';
import type { UIInput } from '@engine/input/UIInput';
import { MENU_CATALOG } from './menuCatalog';
import { DEFAULT_MENU_PROFILE_ID, MENU_PROFILES } from './menuProfiles';
import type { HudRadarContact, MenuNodeId, MenuProfile, MenuTreeNode, Stage6FrameModel, Stage6ObjectContext } from './types';

type MenuEntry =
  | { readonly kind: 'back' }
  | { readonly kind: 'node'; readonly node: MenuTreeNode };

const BACK_ENTRY_LABEL = '< Back';

export class Stage6UiSystem {
  private readonly menuPanel: HTMLDivElement;
  private readonly scenePanel: HTMLDivElement;
  private readonly targetPanel: HTMLDivElement;
  private readonly shipPanel: HTMLDivElement;
  private readonly contextPanel: HTMLDivElement;
  private readonly breadcrumbsElement: HTMLDivElement;
  private readonly menuListElement: HTMLUListElement;
  private readonly menuHintElement: HTMLDivElement;
  private readonly radarCanvas: HTMLCanvasElement;
  private readonly radarContext: CanvasRenderingContext2D;

  private frameModel: Stage6FrameModel | null = null;
  private menuTree: ReadonlyArray<MenuTreeNode> = [];
  private selectedPath: MenuNodeId[] = [];
  private readonly selectionByDepth = new Map<number, number>();
  private selectedLeafAction = 'Wybierz pozycje menu.';

  public constructor(
    private readonly hudLayer: HTMLElement,
    private readonly screenLayer: HTMLElement,
    uiInput: UIInput,
    private readonly modeManager: InputModeManager,
  ) {
    this.scenePanel = document.createElement('div');
    this.scenePanel.className = 'stage6-topbar';

    this.targetPanel = document.createElement('div');
    this.targetPanel.className = 'stage6-target-panel';

    this.shipPanel = document.createElement('div');
    this.shipPanel.className = 'stage6-ship-panel';

    this.radarCanvas = document.createElement('canvas');
    this.radarCanvas.className = 'stage6-radar';
    this.radarCanvas.width = 96;
    this.radarCanvas.height = 96;

    const radarContext = this.radarCanvas.getContext('2d');
    if (!radarContext) {
      throw new Error('Unable to initialize stage6 radar canvas context.');
    }
    this.radarContext = radarContext;

    this.contextPanel = document.createElement('div');
    this.contextPanel.className = 'stage6-context-panel';

    this.hudLayer.append(this.scenePanel, this.targetPanel, this.shipPanel, this.radarCanvas, this.contextPanel);

    this.menuPanel = document.createElement('div');
    this.menuPanel.className = 'stage6-menu-panel';

    this.breadcrumbsElement = document.createElement('div');
    this.breadcrumbsElement.className = 'stage6-breadcrumbs';

    this.menuListElement = document.createElement('ul');
    this.menuListElement.className = 'stage6-menu-list';

    this.menuHintElement = document.createElement('div');
    this.menuHintElement.className = 'stage6-menu-hint';

    this.menuPanel.append(this.breadcrumbsElement, this.menuListElement, this.menuHintElement);
    this.screenLayer.append(this.menuPanel);

    uiInput.onNavigate((direction) => {
      if (this.modeManager.mode !== 'ui') {
        return;
      }

      if (direction === 'up') {
        this.moveSelection(-1);
        return;
      }

      if (direction === 'down') {
        this.moveSelection(1);
        return;
      }

      if (direction === 'left') {
        this.navigateBack();
        return;
      }

      if (direction === 'right') {
        this.activateSelection();
      }
    });

    uiInput.onConfirm(() => {
      if (this.modeManager.mode !== 'ui') {
        return;
      }

      this.activateSelection();
    });

    this.renderShellState();
  }

  public update(model: Stage6FrameModel): void {
    this.frameModel = model;
    this.menuTree = this.buildMenuTree(model.context);
    this.normalizePath();
    this.ensureSelectionBounds();
    this.renderShellState();
  }

  private renderShellState(): void {
    this.renderHud();
    this.renderMenu();
  }

  private renderHud(): void {
    const model = this.frameModel;
    if (!model) {
      this.scenePanel.innerHTML = '';
      this.targetPanel.innerHTML = '';
      this.shipPanel.innerHTML = '';
      this.contextPanel.innerHTML = '';
      this.renderRadar([], 1);
      return;
    }

    const objectTypeLabel = this.formatObjectType(model.context.objectType);

    this.scenePanel.innerHTML = `
      <div class="stage6-topbar-title">${this.escapeHtml(model.context.sceneLabel)}</div>
      <div class="stage6-topbar-meta">${this.escapeHtml(objectTypeLabel)} | ${this.escapeHtml(model.context.sceneDescription)}</div>
      <div class="stage6-topbar-economy">Credits ${this.formatNumber(model.ship.credits)} | Cargo ${model.ship.cargoUsed}/${model.ship.cargoCapacity}</div>
    `;

    if (model.target) {
      this.targetPanel.innerHTML = `
        <h3>TARGET</h3>
        <div class="stage6-target-name">${this.escapeHtml(model.target.name)}</div>
        <div class="stage6-kv">Range <strong>${Math.round(model.target.range)} px</strong></div>
        <div class="stage6-kv">Shield <strong>${model.target.shield}%</strong></div>
        <div class="stage6-kv">Armor <strong>${model.target.armor}%</strong></div>
      `;
    } else {
      this.targetPanel.innerHTML = `
        <h3>TARGET</h3>
        <div class="stage6-empty">Brak zaznaczonego celu.</div>
      `;
    }

    this.shipPanel.innerHTML = `
      <h3>SHIP STATUS</h3>
      <div class="stage6-kv">Callsign <strong>${this.escapeHtml(model.ship.name)}</strong></div>
      <div class="stage6-kv">Velocity <strong>${model.ship.velocity.toFixed(1)} px/s</strong></div>
      <div class="stage6-kv">Cargo <strong>${model.ship.cargoUsed}/${model.ship.cargoCapacity}</strong></div>
      <div class="stage6-reactor-section stage6-reactor-open">
        <div class="stage6-reactor-title">Reactor (${this.escapeHtml(model.ship.reactor.reactorType)})</div>
        <div class="stage6-kv">Output <strong>${model.ship.reactor.output ?? 'runtime pending'}</strong></div>
        <div class="stage6-kv">Load <strong>${model.ship.reactor.load ?? 'runtime pending'}</strong></div>
        <div class="stage6-reactor-note">${this.escapeHtml(model.ship.reactor.notes ?? 'Sekcja pozostaje otwarta na finalne dane Etapu 7.')}</div>
      </div>
    `;

    this.contextPanel.innerHTML = `
      <div class="stage6-context-title">Context</div>
      <div class="stage6-context-copy">${this.escapeHtml(this.selectedLeafAction)}</div>
    `;

    this.renderRadar(model.radarContacts, model.radarRange);
  }

  private renderMenu(): void {
    const model = this.frameModel;
    if (!model || model.mode !== 'ui') {
      this.menuPanel.classList.remove('is-open');
      this.menuListElement.replaceChildren();
      this.breadcrumbsElement.textContent = '';
      this.menuHintElement.textContent = '';
      return;
    }

    this.menuPanel.classList.add('is-open');

    const entries = this.getCurrentEntries();
    const selectedIndex = this.getCurrentSelection();

    const breadcrumbSegments = ['menu'];
    this.selectedPath.forEach((nodeId) => {
      const node = this.findNodeAtDepth(nodeId, breadcrumbSegments.length - 1);
      breadcrumbSegments.push(node?.label ?? nodeId);
    });
    this.breadcrumbsElement.textContent = breadcrumbSegments.join(' / ');

    const fragment = document.createDocumentFragment();
    entries.forEach((entry, index) => {
      const item = document.createElement('li');
      item.className = 'stage6-menu-item';
      if (index === selectedIndex) {
        item.classList.add('is-selected');
      }

      if (entry.kind === 'back') {
        item.innerHTML = `<span>${BACK_ENTRY_LABEL}</span>`;
        fragment.append(item);
        return;
      }

      const hasChildren = entry.node.children.length > 0;
      const marker = hasChildren ? '>' : ' '; 
      const hotkey = entry.node.hotkey ? `<span class="stage6-hotkey">${this.escapeHtml(entry.node.hotkey)}</span>` : '';
      item.innerHTML = `<span>${marker} ${this.escapeHtml(entry.node.label)}</span>${hotkey}`;
      fragment.append(item);
    });

    this.menuListElement.replaceChildren(fragment);

    const selectedEntry = entries[selectedIndex];
    if (!selectedEntry) {
      this.menuHintElement.textContent = 'Brak dostepnych akcji dla tego poziomu.';
      return;
    }

    if (selectedEntry.kind === 'back') {
      this.menuHintElement.textContent = 'Powrot do poprzedniego poziomu.';
      return;
    }

    if (selectedEntry.node.children.length === 0 && !selectedEntry.node.actionId) {
      this.menuHintElement.textContent = 'Ta sekcja jest jeszcze pusta.';
      return;
    }

    this.menuHintElement.textContent = selectedEntry.node.description;
  }

  private renderRadar(contacts: ReadonlyArray<HudRadarContact>, radarRange: number): void {
    const ctx = this.radarContext;
    const width = this.radarCanvas.width;
    const height = this.radarCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = '#071218';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#113040';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    ctx.strokeStyle = '#173847';
    for (let index = 12; index < width; index += 12) {
      ctx.beginPath();
      ctx.moveTo(index + 0.5, 0);
      ctx.lineTo(index + 0.5, height);
      ctx.stroke();
    }
    for (let index = 12; index < height; index += 12) {
      ctx.beginPath();
      ctx.moveTo(0, index + 0.5);
      ctx.lineTo(width, index + 0.5);
      ctx.stroke();
    }

    ctx.fillStyle = '#f7f6d0';
    ctx.fillRect(centerX - 1, centerY - 1, 2, 2);

    if (contacts.length === 0 || radarRange <= 0) {
      return;
    }

    const scale = (width / 2 - 4) / radarRange;
    contacts.forEach((contact) => {
      const rx = Math.max(2, Math.min(width - 3, Math.round(centerX + contact.dx * scale)));
      const ry = Math.max(2, Math.min(height - 3, Math.round(centerY + contact.dy * scale)));

      ctx.fillStyle = this.pickRadarColor(contact.category);
      ctx.fillRect(rx - 1, ry - 1, 2, 2);
    });
  }

  private pickRadarColor(category: HudRadarContact['category']): string {
    switch (category) {
      case 'ship':
        return '#7fffd4';
      case 'station':
        return '#ffd166';
      case 'wreck':
        return '#e58e8e';
      case 'gate':
        return '#94d2ff';
      case 'celestial':
        return '#f7f6d0';
      case 'environment':
      default:
        return '#9fc4d0';
    }
  }

  private buildMenuTree(context: Stage6ObjectContext): ReadonlyArray<MenuTreeNode> {
    const profile = MENU_PROFILES[context.menuProfile] ?? MENU_PROFILES[DEFAULT_MENU_PROFILE_ID];
    const allowedNodes = new Set<MenuNodeId>([
      ...profile.enabledNodeIds,
      ...context.availableNodes,
    ]);

    const roots = profile.rootNodeIds
      .filter((nodeId) => allowedNodes.has(nodeId))
      .map((nodeId) => this.buildNode(nodeId, profile, allowedNodes, new Set<MenuNodeId>()))
      .filter((node): node is MenuTreeNode => node !== null);

    if (roots.length > 0) {
      return roots;
    }

    return this.buildMinimalFallbackTree(context.availableNodes);
  }

  private buildMinimalFallbackTree(availableNodes: ReadonlyArray<MenuNodeId>): ReadonlyArray<MenuTreeNode> {
    const fallbackProfile = MENU_PROFILES[DEFAULT_MENU_PROFILE_ID];
    const allowedNodes = new Set<MenuNodeId>(availableNodes.length > 0 ? availableNodes : fallbackProfile.enabledNodeIds);

    return fallbackProfile.rootNodeIds
      .filter((nodeId) => allowedNodes.has(nodeId))
      .map((nodeId) => this.buildNode(nodeId, fallbackProfile, allowedNodes, new Set<MenuNodeId>()))
      .filter((node): node is MenuTreeNode => node !== null);
  }

  private buildNode(
    nodeId: MenuNodeId,
    profile: MenuProfile,
    allowedNodes: ReadonlySet<MenuNodeId>,
    visited: Set<MenuNodeId>,
  ): MenuTreeNode | null {
    if (visited.has(nodeId)) {
      return null;
    }

    if (!allowedNodes.has(nodeId)) {
      return null;
    }

    const base = MENU_CATALOG[nodeId];
    if (!base) {
      return null;
    }

    const nextVisited = new Set(visited);
    nextVisited.add(nodeId);

    const baseChildren = base.children ?? [];
    const extendedChildren = profile.nodeExtensions?.[nodeId] ?? [];
    const childIds: MenuNodeId[] = [];

    [...baseChildren, ...extendedChildren].forEach((childId) => {
      if (!childIds.includes(childId)) {
        childIds.push(childId);
      }
    });

    const children = childIds
      .filter((childId) => allowedNodes.has(childId))
      .map((childId) => this.buildNode(childId, profile, allowedNodes, nextVisited))
      .filter((node): node is MenuTreeNode => node !== null);

    return {
      id: nodeId,
      label: profile.labelOverrides?.[nodeId] ?? base.label,
      description: profile.descriptionOverrides?.[nodeId] ?? base.description,
      hotkey: base.hotkey,
      actionId: base.actionId,
      children,
    };
  }

  private normalizePath(): void {
    const model = this.frameModel;
    if (!model) {
      this.selectedPath = [];
      return;
    }

    const profile = MENU_PROFILES[model.context.menuProfile] ?? MENU_PROFILES[DEFAULT_MENU_PROFILE_ID];

    if (this.selectedPath.length === 0 && profile.defaultExpandedPath && profile.defaultExpandedPath.length > 0) {
      const path = this.validatePath(profile.defaultExpandedPath);
      if (path.length > 0) {
        this.selectedPath = [...path];
      }
    }

    const validPath = this.validatePath(this.selectedPath);
    if (validPath.length !== this.selectedPath.length) {
      this.selectedPath = validPath;
    }
  }

  private validatePath(candidate: ReadonlyArray<MenuNodeId>): MenuNodeId[] {
    const valid: MenuNodeId[] = [];
    let currentNodes = this.menuTree;

    for (const nodeId of candidate) {
      const node = currentNodes.find((entry) => entry.id === nodeId);
      if (!node || node.children.length === 0) {
        break;
      }

      valid.push(nodeId);
      currentNodes = node.children;
    }

    return valid;
  }

  private moveSelection(delta: number): void {
    const entries = this.getCurrentEntries();
    if (entries.length === 0) {
      return;
    }

    const depth = this.selectedPath.length;
    const current = this.selectionByDepth.get(depth) ?? 0;
    const next = (current + delta + entries.length) % entries.length;
    this.selectionByDepth.set(depth, next);
    this.renderMenu();
  }

  private navigateBack(): void {
    if (this.selectedPath.length === 0) {
      return;
    }

    this.selectedPath = this.selectedPath.slice(0, -1);
    this.ensureSelectionBounds();
    this.renderMenu();
  }

  private activateSelection(): void {
    const entries = this.getCurrentEntries();
    const selected = entries[this.getCurrentSelection()];
    if (!selected) {
      return;
    }

    if (selected.kind === 'back') {
      this.navigateBack();
      return;
    }

    if (selected.node.children.length > 0) {
      this.selectedPath = [...this.selectedPath, selected.node.id];
      this.selectionByDepth.set(this.selectedPath.length, 0);
      this.ensureSelectionBounds();
      this.renderMenu();
      return;
    }

    this.selectedLeafAction = `Wybrano: ${selected.node.label}. (${selected.node.actionId ?? 'panel kontekstowy'})`;

    if (selected.node.actionId === 'exit-ui') {
      this.modeManager.setMode('game');
    }

    this.renderHud();
    this.renderMenu();
  }

  private getCurrentEntries(): MenuEntry[] {
    const nodes = this.getNodesAtCurrentDepth();

    if (nodes.length === 0) {
      return this.selectedPath.length > 0 ? [{ kind: 'back' }] : [];
    }

    const entries: MenuEntry[] = [];
    if (this.selectedPath.length > 0) {
      entries.push({ kind: 'back' });
    }

    nodes.forEach((node) => {
      entries.push({ kind: 'node', node });
    });

    return entries;
  }

  private getNodesAtCurrentDepth(): ReadonlyArray<MenuTreeNode> {
    let nodes = this.menuTree;
    for (const nodeId of this.selectedPath) {
      const node = nodes.find((entry) => entry.id === nodeId);
      if (!node) {
        return [];
      }

      nodes = node.children;
    }

    return nodes;
  }

  private findNodeAtDepth(nodeId: MenuNodeId, depth: number): MenuTreeNode | null {
    if (depth < 0) {
      return null;
    }

    let nodes = this.menuTree;
    for (let index = 0; index < depth; index += 1) {
      const pathNodeId = this.selectedPath[index];
      const pathNode = nodes.find((entry) => entry.id === pathNodeId);
      if (!pathNode) {
        return null;
      }

      nodes = pathNode.children;
    }

    return nodes.find((entry) => entry.id === nodeId) ?? null;
  }

  private getCurrentSelection(): number {
    return this.selectionByDepth.get(this.selectedPath.length) ?? 0;
  }

  private ensureSelectionBounds(): void {
    const entries = this.getCurrentEntries();
    const depth = this.selectedPath.length;

    if (entries.length === 0) {
      this.selectionByDepth.set(depth, 0);
      return;
    }

    const current = this.selectionByDepth.get(depth) ?? 0;
    const normalized = Math.max(0, Math.min(entries.length - 1, current));
    this.selectionByDepth.set(depth, normalized);
  }

  private formatObjectType(objectType: Stage6ObjectContext['objectType']): string {
    switch (objectType) {
      case 'ship':
        return 'Statek';
      case 'station':
        return 'Stacja';
      case 'wreck':
        return 'Wrak';
      case 'mission':
        return 'Punkt misji';
      case 'environment':
      default:
        return 'Obiekt';
    }
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pl-PL').format(value);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
