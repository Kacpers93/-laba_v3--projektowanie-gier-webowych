/**
 * MenuView – renderuje panel menu po prawej stronie ekranu.
 * Montuje się w #screen-layer. Obsługuje kliknięcia myszą.
 */

import type { RuntimeMenuNode } from '../types/menuTypes';

export interface MenuViewCallbacks {
  onSelect: (node: RuntimeMenuNode) => void;
  onBack: () => void;
  onClose: () => void;
}

export class MenuView {
  private readonly overlay: HTMLDivElement;
  private readonly panel: HTMLDivElement;
  private readonly header: HTMLDivElement;
  private readonly breadcrumb: HTMLDivElement;
  private readonly list: HTMLUListElement;
  private readonly contentArea: HTMLDivElement;

  private callbacks: MenuViewCallbacks | null = null;
  private mounted = false;

  public constructor() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'menu-overlay';

    this.panel = document.createElement('div');
    this.panel.id = 'menu-panel';

    this.header = document.createElement('div');
    this.header.id = 'menu-header';

    this.breadcrumb = document.createElement('div');
    this.breadcrumb.id = 'menu-breadcrumb';

    this.list = document.createElement('ul');
    this.list.id = 'menu-list';
    this.list.setAttribute('role', 'menu');

    this.contentArea = document.createElement('div');
    this.contentArea.id = 'menu-content-area';

    this.panel.append(this.header, this.breadcrumb, this.list);
    this.overlay.append(this.contentArea, this.panel);
  }

  public mount(parent: HTMLElement, cbs: MenuViewCallbacks): void {
    if (this.mounted) {
      return;
    }

    this.callbacks = cbs;
    parent.append(this.overlay);
    this.mounted = true;
  }

  public unmount(): void {
    if (!this.mounted) {
      return;
    }

    this.overlay.remove();
    this.mounted = false;
    this.callbacks = null;
  }

  public show(): void {
    this.overlay.classList.add('menu-visible');
  }

  public hide(): void {
    this.overlay.classList.remove('menu-visible');
  }

  public render(
    sceneLabel: string,
    breadcrumbPath: string[],
    nodes: RuntimeMenuNode[],
    activeIndex: number,
    description?: string,
  ): void {
    this.header.textContent = sceneLabel;

    this.renderBreadcrumb(breadcrumbPath);
    this.renderList(nodes, activeIndex);

    if (description !== undefined) {
      this.contentArea.textContent = description;
      this.contentArea.classList.add('has-description');
    } else {
      this.contentArea.textContent = '';
      this.contentArea.classList.remove('has-description');
    }
  }

  private renderBreadcrumb(path: string[]): void {
    this.breadcrumb.replaceChildren();

    if (path.length === 0) {
      this.breadcrumb.textContent = '';
      return;
    }

    path.forEach((segment, index) => {
      const span = document.createElement('span');
      span.className = 'breadcrumb-segment';
      span.textContent = segment;
      this.breadcrumb.append(span);

      if (index < path.length - 1) {
        const sep = document.createElement('span');
        sep.className = 'breadcrumb-sep';
        sep.textContent = ' › ';
        this.breadcrumb.append(sep);
      }
    });
  }

  private renderList(nodes: RuntimeMenuNode[], activeIndex: number): void {
    this.list.replaceChildren();

    nodes.forEach((node, index) => {
      const li = document.createElement('li');
      li.className = 'menu-item';
      li.setAttribute('role', 'menuitem');
      li.setAttribute('data-id', node.id);
      li.setAttribute('data-hotkey', node.hotkey);

      if (index === activeIndex) {
        li.classList.add('menu-item--active');
      }

      const hotkeyBadge = document.createElement('span');
      hotkeyBadge.className = 'hotkey-badge';
      hotkeyBadge.textContent = node.hotkey.toUpperCase();

      const labelSpan = document.createElement('span');
      labelSpan.className = 'item-label';
      labelSpan.textContent = node.label;

      const arrowSpan = document.createElement('span');
      arrowSpan.className = 'item-arrow';
      arrowSpan.textContent = node.isLeaf ? '' : '›';

      li.append(hotkeyBadge, labelSpan, arrowSpan);

      li.addEventListener('click', () => {
        this.callbacks?.onSelect(node);
      });

      li.addEventListener('mouseenter', () => {
        this.list.querySelectorAll('.menu-item--active').forEach((el) => {
          el.classList.remove('menu-item--active');
        });
        li.classList.add('menu-item--active');
      });

      this.list.append(li);
    });
  }

  public setActiveIndex(index: number): void {
    const items = this.list.querySelectorAll('.menu-item');
    items.forEach((item, i) => {
      item.classList.toggle('menu-item--active', i === index);
    });

    const activeItem = items[index] as HTMLElement | undefined;
    activeItem?.scrollIntoView({ block: 'nearest' });
  }

  public setContentDescription(text: string | undefined): void {
    if (text !== undefined) {
      this.contentArea.textContent = text;
      this.contentArea.classList.add('has-description');
    } else {
      this.contentArea.textContent = '';
      this.contentArea.classList.remove('has-description');
    }
  }
}
